import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides'

declare module '@material-ui/core/styles/overrides' {
  interface ComponentNameToClassKey {
    MUIDataTable: {
      root: {
        height: React.CSSProperties.height
      }
      paper: {
        height: React.CSSProperties.height
      }
      responsiveScroll: {
        maxHeight: React.CSSProperties.height
        height: React.CSSProperties.height
      }
    }
    MUIDataTableToolbar: {
      root: {
        background: React.CSSProperties.background
      }
      actions: {
        background: React.CSSProperties.background
        display: React.CSSProperties.display
        alignItems: React.CSSProperties.alignItems
        justifyContent: React.CSSProperties.justifyContent
      }
    }
    MUIDataTableSelectCell: {
      root: {
        display: React.CSSProperties.display
      }
    }
  }
}
