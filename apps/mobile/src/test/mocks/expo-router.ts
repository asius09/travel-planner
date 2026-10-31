export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  back: () => {},
})

export const useLocalSearchParams = () => ({})
export const useSegments = () => []

export const Link = ({ children, ...props }: any) => {
  const React = require('react')
  return React.createElement('Link', props, children)
}

export const Tabs = Object.assign(
  ({ children }: any) => {
    const React = require('react')
    return React.createElement('Tabs', null, children)
  },
  {
    Screen: ({ children }: any) => {
      const React = require('react')
      return React.createElement('Screen', null, children)
    },
  }
)

export const Stack = Object.assign(
  ({ children }: any) => {
    const React = require('react')
    return React.createElement('Stack', null, children)
  },
  {
    Screen: ({ children }: any) => {
      const React = require('react')
      return React.createElement('Screen', null, children)
    },
  }
)
