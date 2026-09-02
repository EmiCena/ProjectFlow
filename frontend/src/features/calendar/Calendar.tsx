export default function Calendar() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Google Calendar</h1>
      <div className="bg-card dark:bg-slate-900 p-6 rounded-lg shadow border text-center">
        <p className="text-sm text-muted-foreground">Connect your Google Calendar to sync project deadlines and milestones</p>
        <button className="mt-4 bg-primary text-white px-4 py-2 rounded text-sm">Connect Google Calendar (mock)</button>
        <p className="text-xs text-muted-foreground mt-2">OAuth2 flow would redirect to Google consent screen</p>
      </div>
    </div>
  )
}
