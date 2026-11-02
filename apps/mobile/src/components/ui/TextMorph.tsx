'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
import {
  Text,
  View,
  StyleSheet,
  type ColorValue,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
  type TextProps,
} from 'react-native'
import Animated, {
  Easing,
  LayoutAnimationConfig,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type EasingFunction,
  type EasingFunctionFactory,
  type EntryExitAnimationFunction,
  type LayoutAnimation,
} from 'react-native-reanimated'

export type TMorphingTextVariant = 'text' | 'number' | 'slots'
export type TMotionPreset = 'default' | 'smooth' | 'snappy' | 'bouncy'
export type TRise = 1 | -1 | 0
export type TEasing = EasingFunction | EasingFunctionFactory

export interface IScatter {
  readonly x?: number
  readonly y?: number
}

export interface ITimingTransition {
  readonly type: 'timing'
  readonly duration: number
  readonly easing: TEasing
}

export interface ISpringTransition {
  readonly type: 'spring'
  readonly duration: number
  readonly dampingRatio: number
}

export type TTransition = ITimingTransition | ISpringTransition
export type TLayoutTransition = LinearTransition
export type TGlyphAnimation = EntryExitAnimationFunction

export interface IGlyphFrame {
  readonly opacity: number
  readonly translateX: number
  readonly translateY: number
  readonly scale: number
}

export interface IResolvedTransition {
  readonly transition: TTransition
  readonly layout: TLayoutTransition
}

export interface IGlyphProps {
  readonly char: string
  readonly textStyle?: StyleProp<TextStyle>
  readonly className?: string
}

export interface IMorphLayerProps {
  readonly text: string
  readonly transition: TTransition
  readonly layout: TLayoutTransition
  readonly stagger: number
  readonly initial: boolean
  readonly textStyle?: StyleProp<TextStyle>
  readonly className?: string
}

export interface IGlyphTrackProps extends IMorphLayerProps {
  readonly scatterX: number
  readonly scatterY: number
  readonly rise: number
}

export interface IDigitRollProps extends IMorphLayerProps {}
export interface IDigitReelProps extends IMorphLayerProps {}

export interface IReelColumnProps {
  readonly digit: number
  readonly direction: number
  readonly transition: TTransition
  readonly delay: number
  readonly animateIn: boolean
  readonly textStyle?: StyleProp<TextStyle>
}

export interface IReelDigitProps {
  readonly value: number
  readonly current: { value: number }
  readonly height: { value: number }
  readonly textStyle?: StyleProp<TextStyle>
}

export interface IReelProgress {
  digit: number
  total: number
}

export interface TGlyphPair {
  0: number
  1: number
}

export interface IGlyphIdsResult {
  readonly ids: readonly string[]
  readonly churn: number
  readonly idSeed: number
}

export interface IGlyphIdsState {
  readonly text: string
  readonly ids: readonly string[]
  readonly idSeed: number
  readonly churn: number
}

export interface IDigitIdsResult {
  readonly ids: readonly number[]
  readonly direction: number
  readonly idSeed: number
}

export interface IDigitIdsState {
  readonly text: string
  readonly ids: readonly number[]
  readonly idSeed: number
  readonly direction: number
}

export interface IMorphingTextProps extends Omit<TextProps, 'children'> {
  readonly text?: string | number
  readonly children?: string | number
  readonly variant?: TMorphingTextVariant
  readonly preset?: TMotionPreset
  readonly transition?: TTransition
  readonly scatter?: IScatter
  readonly rise?: TRise
  readonly stagger?: number
  readonly initial?: boolean
  readonly autoSize?: boolean
  readonly onComplete?: () => void
  readonly fontSize?: number
  readonly color?: ColorValue
  readonly style?: StyleProp<ViewStyle>
  readonly textStyle?: StyleProp<TextStyle>
  readonly className?: string
  // Legacy backward-compatibility props for existing Outta call-sites
  readonly mode?: 'smooth' | 'word' | 'char'
  readonly duration?: number
  readonly enableBlur?: boolean
  readonly blurIntensity?: number
  readonly containerStyle?: StyleProp<ViewStyle>
}

export type TextMorphProps = IMorphingTextProps
export const MOTION_PRESETS: Readonly<Record<TMotionPreset, TTransition>> = {
  default: {
    type: 'timing',
    duration: 380,
    easing: Easing.bezier(0.19, 1, 0.22, 1),
  },
  smooth: { type: 'spring', duration: 400, dampingRatio: 1 },
  snappy: { type: 'spring', duration: 350, dampingRatio: 0.85 },
  bouncy: { type: 'spring', duration: 500, dampingRatio: 0.7 },
}

export const DIGIT_TRAVEL = 8
export const RISE_DISTANCE = 8
export const DEFAULT_SCATTER_X = 15
export const DEFAULT_SCATTER_Y = 0
export const DEFAULT_STAGGER = 20
export const SPRING_PERCEPTUAL_RATIO = 1.5
export const REEL_DIGITS: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

const NON_BREAKING_SPACE = '\u00A0'
const HIDDEN_SCALE = 0.85
const DIGIT_HIDDEN_SCALE = 0.5

const IDLE_FRAME: IGlyphFrame = {
  opacity: 1,
  translateX: 0,
  translateY: 0,
  scale: 1,
}

const getSegmenter = (): Intl.Segmenter | null => {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    try {
      return new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    } catch {
      return null
    }
  }
  return null
}

const segmenter: Intl.Segmenter | null = getSegmenter()

export const segmentGraphemes = (text: string): string[] => {
  if (!text) return []
  if (segmenter) {
    return Array.from(
      segmenter.segment(text) as Iterable<{ segment: string }>,
      (s) => s.segment
    )
  }
  return Array.from(text)
}

export const toGlyph = (grapheme: string): string =>
  grapheme === ' ' ? NON_BREAKING_SPACE : grapheme

export const isNumeral = (char: string): boolean => char >= '0' && char <= '9'

export const wrap = (n: number, m: number): number => {
  'worklet'
  return ((n % m) + m) % m
}

export const leadingTextLength = (chars: readonly string[]): number => {
  const index = chars.findIndex(isNumeral)
  return index === -1 ? chars.length : index
}

export const parseNumeric = (text: string): number =>
  parseFloat(text.replace(/[^0-9.-]/g, '')) || 0

function padLeft<T>(items: readonly T[], length: number, fill: T): T[] {
  return [
    ...new Array<T>(Math.max(0, length - items.length)).fill(fill),
    ...items,
  ]
}

export const findSharedGlyphs = (
  oldSegments: readonly string[],
  newSegments: readonly string[]
): [number, number][] => {
  const m = oldSegments.length
  const n = newSegments.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        oldSegments[i - 1] === newSegments[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  const pairs: [number, number][] = []
  let i = m
  let j = n

  while (i > 0 && j > 0) {
    if (oldSegments[i - 1] === newSegments[j - 1]) {
      pairs.push([i - 1, j - 1])
      i--
      j--
    } else if (
      dp[i - 1][j] > dp[i][j - 1] ||
      (dp[i - 1][j] === dp[i][j - 1] && i >= j)
    ) {
      i--
    } else {
      j--
    }
  }

  return pairs.reverse()
}

export const assignGlyphIds = (
  prevText: string,
  newText: string,
  prevIds: readonly string[],
  idSeed: number
): IGlyphIdsResult => {
  const prevSegments = segmentGraphemes(prevText)
  const newSegments = segmentGraphemes(newText)
  const ids = new Array<string>(newSegments.length).fill('')

  for (const [oldIndex, newIndex] of findSharedGlyphs(prevSegments, newSegments)) {
    ids[newIndex] = prevIds[oldIndex]
  }

  let id = idSeed
  let addedCount = 0
  for (let k = 0; k < ids.length; k++) {
    if (!ids[k]) {
      ids[k] = `g${id++}`
      addedCount++
    }
  }

  const keptCount = newSegments.length - addedCount
  const removedCount = prevSegments.length - keptCount
  const maxLength = Math.max(newSegments.length, prevSegments.length)

  return {
    ids,
    churn: maxLength > 0 ? (addedCount + removedCount) / maxLength : 1,
    idSeed: id,
  }
}

export const assignDigitIds = (
  prevText: string,
  newText: string,
  prevIds: readonly number[],
  idSeed: number
): IDigitIdsResult => {
  const direction = Math.sign(parseNumeric(newText) - parseNumeric(prevText))
  const oldChars = segmentGraphemes(prevText)
  const newChars = segmentGraphemes(newText)

  const newPrefixLength = leadingTextLength(newChars)
  const oldPrefixLength = leadingTextLength(oldChars)
  const sharedPrefixLength = Math.min(newPrefixLength, oldPrefixLength)

  const ids = new Array<number>(newChars.length)
  let id = idSeed

  for (let i = 0; i < newPrefixLength; i++) {
    ids[i] =
      i < sharedPrefixLength && newChars[i] === oldChars[i] ? prevIds[i] : id++
  }

  const oldBody = oldChars.slice(oldPrefixLength)
  const newBody = newChars.slice(newPrefixLength)
  const maxBodyLength = Math.max(oldBody.length, newBody.length)

  const paddedOld = padLeft(oldBody, maxBodyLength, '')
  const paddedNew = padLeft(newBody, maxBodyLength, '')
  const paddedIds = padLeft(prevIds.slice(oldPrefixLength), maxBodyLength, -1)

  const bodyOffset = maxBodyLength - newBody.length
  for (let i = 0; i < newBody.length; i++) {
    const p = bodyOffset + i
    ids[newPrefixLength + i] =
      paddedNew[p] === paddedOld[p] && paddedIds[p] >= 0 ? paddedIds[p] : id++
  }

  return { ids, direction, idSeed: id }
}
export const animateTo = (
  toValue: number,
  transition: TTransition,
  delay: number = 0
): number => {
  'worklet'
  const motion =
    transition.type === 'spring'
      ? withSpring(toValue, {
          duration: transition.duration / SPRING_PERCEPTUAL_RATIO,
          dampingRatio: transition.dampingRatio,
        })
      : withTiming(toValue, {
          duration: transition.duration,
          easing: transition.easing,
        })

  return delay > 0 ? withDelay(delay, motion) : motion
}

export const createLayoutTransition = (transition: TTransition): TLayoutTransition => {
  if (transition.type === 'spring') {
    return LinearTransition.springify(
      transition.duration / SPRING_PERCEPTUAL_RATIO
    ).dampingRatio(transition.dampingRatio)
  }
  return LinearTransition.duration(transition.duration).easing(transition.easing)
}

export const createGlyphEntering = (
  from: IGlyphFrame,
  transition: TTransition,
  delay: number = 0
): TGlyphAnimation => {
  return (): LayoutAnimation => {
    'worklet'
    return {
      initialValues: {
        opacity: from.opacity,
        transform: [
          { translateX: from.translateX },
          { translateY: from.translateY },
          { scale: from.scale },
        ],
      },
      animations: {
        opacity: animateTo(IDLE_FRAME.opacity, transition, delay),
        transform: [
          { translateX: animateTo(IDLE_FRAME.translateX, transition, delay) },
          { translateY: animateTo(IDLE_FRAME.translateY, transition, delay) },
          { scale: animateTo(IDLE_FRAME.scale, transition, delay) },
        ],
      },
    }
  }
}

export const createGlyphExiting = (
  to: IGlyphFrame,
  transition: TTransition,
  delay: number = 0
): TGlyphAnimation => {
  return (): LayoutAnimation => {
    'worklet'
    return {
      initialValues: {
        opacity: IDLE_FRAME.opacity,
        transform: [
          { translateX: IDLE_FRAME.translateX },
          { translateY: IDLE_FRAME.translateY },
          { scale: IDLE_FRAME.scale },
        ],
      },
      animations: {
        opacity: animateTo(to.opacity, transition, delay),
        transform: [
          { translateX: animateTo(to.translateX, transition, delay) },
          { translateY: animateTo(to.translateY, transition, delay) },
          { scale: animateTo(to.scale, transition, delay) },
        ],
      },
    }
  }
}

export const createFade = (
  transition: TTransition
): readonly [entering: TGlyphAnimation, exiting: TGlyphAnimation] => {
  const hidden: IGlyphFrame = { ...IDLE_FRAME, opacity: 0 }
  return [
    createGlyphEntering(hidden, transition),
    createGlyphExiting(hidden, transition),
  ]
}

export const useGlyphIds = (
  text: string,
  graphemes: readonly string[]
): IGlyphIdsState => {
  const [state, setState] = useState<IGlyphIdsState>(() => ({
    text,
    ids: graphemes.map((_, i) => `g${i}`),
    idSeed: graphemes.length,
    churn: 0,
  }))

  if (text !== state.text) {
    const next: IGlyphIdsState = {
      text,
      ...assignGlyphIds(state.text, text, state.ids, state.idSeed),
    }
    setState(next)
    return next
  }

  return state
}

export const useDigitIds = (
  text: string,
  chars: readonly string[]
): IDigitIdsState => {
  const [state, setState] = useState<IDigitIdsState>(() => ({
    text,
    ids: chars.map((_, i) => i),
    idSeed: chars.length,
    direction: 1,
  }))

  if (text !== state.text) {
    const next: IDigitIdsState = {
      text,
      ...assignDigitIds(state.text, text, state.ids, state.idSeed),
    }
    setState(next)
    return next
  }

  return state
}

export const useResolvedTransition = (
  variant: TMorphingTextVariant,
  preset?: TMotionPreset,
  transition?: TTransition,
  customDuration?: number
): IResolvedTransition =>
  useMemo<IResolvedTransition>(() => {
    let resolved: TTransition =
      transition ??
      MOTION_PRESETS[preset ?? (variant === 'number' ? 'snappy' : 'default')]

    if (customDuration !== undefined && customDuration > 0) {
      if (resolved.type === 'timing') {
        resolved = { ...resolved, duration: customDuration }
      } else {
        resolved = { ...resolved, duration: customDuration }
      }
    }

    return {
      transition: resolved,
      layout: createLayoutTransition(resolved),
    }
  }, [variant, preset, transition, customDuration])

export const useSettleCallback = (
  text: string,
  totalDuration: number,
  initial: boolean,
  onComplete?: () => void
): void => {
  const onCompleteRef = useRef<(() => void) | undefined>(onComplete)
  const hasMountedRef = useRef<boolean>(false)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      if (!initial) return
    }

    const timeout = setTimeout(() => onCompleteRef.current?.(), totalDuration)
    return () => clearTimeout(timeout)
  }, [text, totalDuration, initial])
}

export const Glyph = React.memo<IGlyphProps>(
  ({ char, textStyle, className }: IGlyphProps): React.JSX.Element => (
    <Text style={textStyle} className={className}>{toGlyph(char)}</Text>
  )
)
Glyph.displayName = 'Glyph'

export const GlyphTrack = React.memo<IGlyphTrackProps>(
  ({
    text,
    transition,
    layout,
    scatterX,
    scatterY,
    rise,
    textStyle,
    className,
  }: IGlyphTrackProps): React.JSX.Element => {
    const graphemes = useMemo<string[]>(() => segmentGraphemes(text), [text])
    const { ids, churn } = useGlyphIds(text, graphemes)

    return (
      <>
        {graphemes.map((char, i) => {
          const progress =
            graphemes.length <= 1 ? 0 : i / (graphemes.length - 1)
          const offsetX = (progress - 0.5) * scatterX * churn
          const offsetY = (progress - 0.5) * scatterY * churn
          const riseY = rise * RISE_DISTANCE * churn

          const from: IGlyphFrame = {
            opacity: 0,
            translateX: offsetX,
            translateY: offsetY + riseY,
            scale: HIDDEN_SCALE,
          }
          const to: IGlyphFrame = { ...from, translateY: offsetY - riseY }

          return (
            <Animated.View
              key={ids[i] ?? `fallback-${i}`}
              layout={layout}
              entering={createGlyphEntering(from, transition)}
              exiting={createGlyphExiting(to, transition)}
            >
              <Glyph char={char} textStyle={textStyle} className={className} />
            </Animated.View>
          )
        })}
      </>
    )
  }
)
GlyphTrack.displayName = 'GlyphTrack'

export const DigitRoll = React.memo<IDigitRollProps>(
  ({
    text,
    transition,
    layout,
    stagger,
    textStyle,
  }: IDigitRollProps): React.JSX.Element => {
    const chars = useMemo<string[]>(() => segmentGraphemes(text), [text])
    const { ids, direction } = useDigitIds(text, chars)
    const [fadeIn, fadeOut] = useMemo(
      () => createFade(transition),
      [transition]
    )
    const prefixLength = leadingTextLength(chars)
    const travel = direction > 0 ? DIGIT_TRAVEL : -DIGIT_TRAVEL

    return (
      <>
        {chars.map((char, i) => {
          if (i < prefixLength) {
            return (
              <Animated.View key={`head-${i}`} layout={layout}>
                <Glyph char={char} textStyle={textStyle} />
              </Animated.View>
            )
          }

          const delay = i * stagger
          const distance = isNumeral(char) ? travel : 0
          const from: IGlyphFrame = {
            opacity: 0,
            translateX: 0,
            translateY: distance,
            scale: DIGIT_HIDDEN_SCALE,
          }
          const to: IGlyphFrame = { ...from, translateY: -distance }

          return (
            <Animated.View
              key={`slot-${chars.length - 1 - i}`}
              layout={layout}
              entering={fadeIn}
              exiting={fadeOut}
            >
              <Animated.View
                key={ids[i] ?? `digit-${i}`}
                entering={createGlyphEntering(from, transition, delay)}
                exiting={createGlyphExiting(to, transition, delay)}
              >
                <Glyph char={char} textStyle={textStyle} />
              </Animated.View>
            </Animated.View>
          )
        })}
      </>
    )
  }
)
DigitRoll.displayName = 'DigitRoll'

const getSpinDistance = (
  previous: number,
  next: number,
  direction: number
): number => {
  if (direction > 0)
    return next >= previous ? next - previous : 10 - previous + next
  if (direction < 0)
    return previous >= next ? next - previous : -(10 - next + previous)
  return next - previous
}

export const ReelDigit = React.memo<IReelDigitProps>(
  ({
    value,
    current,
    height,
    textStyle,
  }: IReelDigitProps): React.JSX.Element => {
    const animatedStyle = useAnimatedStyle<TextStyle>(() => {
      let offset = wrap(value - current.value, 10)
      if (offset > 5) offset -= 10
      const clamped = Math.max(-1, Math.min(1, offset))

      return {
        opacity: 1 - Math.abs(clamped),
        transform: [{ translateY: -clamped * (height.value || 30) }],
      }
    })

    return (
      <Animated.Text
        aria-hidden
        style={[textStyle, styles.reelDigit, animatedStyle]}
      >
        {value}
      </Animated.Text>
    )
  }
)
ReelDigit.displayName = 'ReelDigit'

export const ReelColumn = React.memo<IReelColumnProps>(
  ({
    digit,
    direction,
    transition,
    delay,
    animateIn,
    textStyle,
  }: IReelColumnProps): React.JSX.Element => {
    const [tracker, setTracker] = useState<IReelProgress>({
      digit,
      total: digit,
    })
    const current = useSharedValue<number>(
      animateIn ? digit - Math.max(digit, 1) * (direction || 1) : digit
    )
    const height = useSharedValue<number>(0)
    const hasMountedRef = useRef<boolean>(false)

    let { total } = tracker
    if (digit !== tracker.digit) {
      total += getSpinDistance(tracker.digit, digit, direction)
      setTracker({ digit, total })
    }

    useEffect(() => {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true
        if (!animateIn) return
      }
      current.value = animateTo(total, transition, delay)
    }, [total, transition, delay, animateIn, current])

    const onPlaceholderLayout = (event: LayoutChangeEvent): void => {
      height.value = event.nativeEvent.layout.height
    }

    return (
      <View style={styles.reelColumn}>
        <Text
          style={[textStyle, styles.reelPlaceholder]}
          onLayout={onPlaceholderLayout}
        >
          0
        </Text>
        {REEL_DIGITS.map((value) => (
          <ReelDigit
            key={value}
            value={value}
            current={current}
            height={height}
            textStyle={textStyle}
          />
        ))}
      </View>
    )
  }
)
ReelColumn.displayName = 'ReelColumn'

export const DigitReel = React.memo<IDigitReelProps>(
  ({
    text,
    transition,
    layout,
    stagger,
    initial,
    textStyle,
  }: IDigitReelProps): React.JSX.Element => {
    const chars = useMemo<string[]>(() => segmentGraphemes(text), [text])
    const { direction } = useDigitIds(text, chars)
    const [, fadeOut] = useMemo(() => createFade(transition), [transition])
    const [isMounted, setIsMounted] = useState<boolean>(false)

    useEffect(() => {
      const frame = requestAnimationFrame(() => setIsMounted(true))
      return () => cancelAnimationFrame(frame)
    }, [])

    const prefixLength = leadingTextLength(chars)
    const numeralCount = chars.filter(isNumeral).length
    let numeralIndex = 0

    return (
      <>
        {chars.map((char, i) => {
          const isPrefix = i < prefixLength
          const key = isPrefix ? `head-${i}` : `slot-${chars.length - 1 - i}`

          if (isPrefix || !isNumeral(char)) {
            return (
              <Animated.View
                key={key}
                layout={layout}
                exiting={isPrefix ? undefined : fadeOut}
              >
                <Glyph char={char} textStyle={textStyle} />
              </Animated.View>
            )
          }

          const delay = (numeralCount - 1 - numeralIndex) * stagger
          numeralIndex++

          return (
            <Animated.View key={key} layout={layout} exiting={fadeOut}>
              <ReelColumn
                digit={Number(char)}
                direction={direction}
                transition={transition}
                delay={delay}
                animateIn={isMounted || initial}
                textStyle={textStyle}
              />
            </Animated.View>
          )
        })}
      </>
    )
  }
)
DigitReel.displayName = 'DigitReel'

export const MorphingText = React.memo<IMorphingTextProps>(
  ({
    text: propText,
    children,
    variant = 'text',
    preset = 'smooth',
    transition: customTransition,
    scatter: {
      x: scatterX = DEFAULT_SCATTER_X,
      y: scatterY = DEFAULT_SCATTER_Y,
    } = {},
    rise = 0,
    stagger = DEFAULT_STAGGER,
    initial = false,
    autoSize = true,
    onComplete,
    fontSize,
    color,
    style,
    textStyle,
    className,
    containerStyle,
    duration,
    mode,
    ...textProps
  }: IMorphingTextProps): React.JSX.Element => {
    // Accommodate children or text prop
    const rawValue = propText !== undefined ? propText : children !== undefined ? children : ''
    const value = String(rawValue)

    // Determine variant from legacy mode if provided
    let effectiveVariant = variant
    if (mode === 'char' || mode === 'word') {
      effectiveVariant = 'text'
    }

    const { transition, layout } = useResolvedTransition(
      effectiveVariant,
      preset,
      customTransition,
      duration
    )

    const composedTextStyle = useMemo<StyleProp<TextStyle>>(
      () => [
        styles.defaultText,
        fontSize ? { fontSize } : null,
        color ? { color } : null,
        textStyle,
        style as TextStyle,
      ],
      [fontSize, color, textStyle, style]
    )

    const staggerSpan =
      effectiveVariant === 'text' ? 0 : Math.max(0, value.length - 1) * stagger
    useSettleCallback(
      value,
      transition.duration + staggerSpan,
      initial,
      onComplete
    )

    const layerProps: IMorphLayerProps = {
      text: value,
      transition,
      layout,
      stagger,
      initial,
      textStyle: composedTextStyle,
      className,
    }

    return (
      <LayoutAnimationConfig skipEntering={!initial}>
        <Animated.View
          accessible
          accessibilityLabel={value}
          layout={autoSize ? layout : undefined}
          style={[styles.row, containerStyle, style]}
          className={className}
        >
          {effectiveVariant === 'number' ? (
            <DigitRoll {...layerProps} />
          ) : effectiveVariant === 'slots' ? (
            <DigitReel {...layerProps} />
          ) : (
            <GlyphTrack
              {...layerProps}
              scatterX={scatterX}
              scatterY={scatterY}
              rise={rise}
            />
          )}
        </Animated.View>
      </LayoutAnimationConfig>
    )
  }
)

MorphingText.displayName = 'MorphingText'

export const TextMorph = MorphingText
export const Torph = MorphingText

export default MorphingText
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultText: {
    includeFontPadding: false,
  },
  reelColumn: {
    position: 'relative',
    overflow: 'hidden',
  },
  reelPlaceholder: {
    opacity: 0,
  },
  reelDigit: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
})