import React from "react"

export default class ErrorBoundary extends React.Component<{children: React.ReactNode, fallback?: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) { super(props); this.state = {hasError: false, error: null} }
  static getDerivedStateFromError(error: any) { return {hasError: true, error} }
  componentDidCatch(error: any, info: any) { console.error("[ErrorBoundary]", error, info) }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border border-red-200 rounded m-4">
          <h3 className="font-bold text-red-700">Algo falló</h3>
          <p className="text-sm text-red-600 mt-1">Error: {String(this.state.error?.message || this.state.error)}</p>
          <button onClick={()=>{ this.setState({hasError:false, error:null}); location.reload() }} className="mt-3 bg-red-600 text-white px-3 py-1 rounded text-sm">Recargar</button>
        </div>
      )
    }
    return this.props.children
  }
}
