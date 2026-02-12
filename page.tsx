"use client"

import { useState, useCallback } from "react"
import useSWR, { mutate } from "swr"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Toaster, toast } from "sonner"
import {
  Bot,
  MessageSquare,
  Terminal,
  Activity,
  Settings,
  Eye,
  EyeOff,
  Plug,
  Unplug,
  Loader2,
  Send,
  Sparkles,
  Plus,
  Upload,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface BotConfig {
  token: string
  guildId: string
  channelId: string
  message: string
  isConnected: boolean
  hasToken?: boolean
}

interface LogEntry {
  id: string
  timestamp: string
  type: "info" | "success" | "error" | "warning"
  message: string
}

interface SlashCommand {
  name: string
  description: string
  response: string
  enabled: boolean
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const navItems = [
  { id: "config", label: "Bot Config", icon: Settings },
  { id: "messages", label: "Message Builder", icon: MessageSquare },
  { id: "commands", label: "Slash Commands", icon: Terminal },
  { id: "logs", label: "Activity Logs", icon: Activity },
]

function Sidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">Bot Dashboard</h1>
          <p className="text-xs text-muted-foreground">Discord Bot Manager</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              activeTab === item.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

// ─── Bot Config Panel ────────────────────────────────────────────────────────

function BotConfigPanel({
  config,
  onSave,
  onConnect,
  onDisconnect,
}: {
  config: BotConfig
  onSave: (c: Partial<BotConfig>) => Promise<void>
  onConnect: () => Promise<void>
  onDisconnect: () => Promise<void>
}) {
  const [token, setToken] = useState(config.token)
  const [guildId, setGuildId] = useState(config.guildId)
  const [channelId, setChannelId] = useState(config.channelId)
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave({ token, guildId, channelId })
    setSaving(false)
  }

  const handleConnect = async () => {
    setConnecting(true)
    if (config.isConnected) {
      await onDisconnect()
    } else {
      await onConnect()
    }
    setConnecting(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Bot Configuration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your Discord Bot Application credentials and target server.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Connection Status</CardTitle>
          <CardDescription className="text-muted-foreground">Current bot connection status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${config.isConnected ? "bg-accent" : "bg-destructive"}`} />
              <span className="text-sm font-medium text-foreground">
                {config.isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <Button
              onClick={handleConnect}
              disabled={connecting || !token}
              variant={config.isConnected ? "destructive" : "default"}
              size="sm"
              className={config.isConnected ? "" : "bg-accent text-accent-foreground hover:bg-accent/90"}
            >
              {connecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : config.isConnected ? (
                <Unplug className="mr-2 h-4 w-4" />
              ) : (
                <Plug className="mr-2 h-4 w-4" />
              )}
              {config.isConnected ? "Disconnect" : "Connect Bot"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Bot Credentials</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your Bot Application token from the Discord Developer Portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="token" className="text-sm text-foreground">Bot Token</Label>
            <div className="relative">
              <Input
                id="token"
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your bot token..."
                className="border-border bg-secondary pr-10 text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {"Get your token from "}
              <a
                href="https://discord.com/developers/applications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Discord Developer Portal
              </a>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="guildId" className="text-sm text-foreground">Guild ID (Server ID)</Label>
            <Input
              id="guildId"
              value={guildId}
              onChange={(e) => setGuildId(e.target.value)}
              placeholder="Enter guild ID..."
              className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="channelId" className="text-sm text-foreground">Channel ID</Label>
            <Input
              id="channelId"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="Enter channel ID..."
              className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 w-fit bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Message Builder ─────────────────────────────────────────────────────────

const quickMessages = [
  { label: "Welcome", text: "Welcome to the server! Please read the rules." },
  { label: "Announcement", text: "Important announcement: Please check the announcements channel." },
  { label: "Event", text: "We have a new event coming up! Stay tuned for more details." },
  { label: "Maintenance", text: "The server will be under maintenance. Sorry for the inconvenience." },
  { label: "Thank You", text: "Thank you all for being part of this community!" },
  { label: "Custom Greeting", text: "Hey everyone! Hope you are having a great day!" },
]

function MessageBuilder({
  message: initialMessage,
  isConnected,
  onSendMessage,
  onUpdateMessage,
}: {
  message: string
  isConnected: boolean
  onSendMessage: (msg: string) => Promise<void>
  onUpdateMessage: (msg: string) => Promise<void>
}) {
  const [message, setMessage] = useState(initialMessage)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    await onSendMessage(message)
    setSending(false)
  }

  const handleQuickMessage = (text: string) => {
    setMessage(text)
    onUpdateMessage(text)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Message Builder</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Compose and send messages to your Discord channel.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-base text-foreground">Quick Messages</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Click a button to use a pre-made message template.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickMessages.map((qm) => (
              <Button
                key={qm.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickMessage(qm.text)}
                className="border-border bg-secondary text-secondary-foreground hover:border-primary/30 hover:bg-primary/15 hover:text-primary"
              >
                {qm.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Compose Message</CardTitle>
          <CardDescription className="text-muted-foreground">
            Write your message below. Supports Discord markdown.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="message" className="text-sm text-foreground">Message Content</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              className="resize-none border-border bg-secondary text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">{message.length}/2000 characters</p>
          </div>

          {message.trim() && (
            <Card className="border-border bg-secondary">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    BOT
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">Discord Bot</span>
                      <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        BOT
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-secondary-foreground">{message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSend}
              disabled={sending || !isConnected || !message.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Message
            </Button>
            {!isConnected && (
              <p className="flex items-center text-xs text-destructive">Bot must be connected to send messages</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Slash Commands Panel ────────────────────────────────────────────────────

function SlashCommandsPanel({
  commands,
  isConnected,
  onToggleCommand,
  onAddCommand,
  onRegisterCommands,
}: {
  commands: SlashCommand[]
  isConnected: boolean
  onToggleCommand: (name: string, enabled: boolean) => Promise<void>
  onAddCommand: (cmd: SlashCommand) => Promise<void>
  onRegisterCommands: () => Promise<void>
}) {
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newResponse, setNewResponse] = useState("")
  const [registering, setRegistering] = useState(false)

  const handleAdd = async () => {
    if (!newName.trim() || !newDesc.trim() || !newResponse.trim()) return
    await onAddCommand({
      name: newName.toLowerCase().replace(/\s+/g, "-"),
      description: newDesc,
      response: newResponse,
      enabled: true,
    })
    setNewName("")
    setNewDesc("")
    setNewResponse("")
    setShowNew(false)
  }

  const handleRegister = async () => {
    setRegistering(true)
    await onRegisterCommands()
    setRegistering(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Slash Commands</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage bot slash commands (/) that users can invoke in Discord.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRegister}
            disabled={registering || !isConnected}
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {registering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Register Commands
          </Button>
          <Button onClick={() => setShowNew(!showNew)} size="sm" variant="outline" className="border-border text-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Add Command
          </Button>
        </div>
      </div>

      {showNew && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="text-base text-foreground">New Slash Command</CardTitle>
            <CardDescription className="text-muted-foreground">Create a new slash command for your bot.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">Command Name</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">/</span>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="command-name"
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">Description</Label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What does this command do?"
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-foreground">Response Message</Label>
              <Textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="What the bot will reply..."
                rows={3}
                className="resize-none border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAdd}
                disabled={!newName.trim() || !newDesc.trim() || !newResponse.trim()}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create Command
              </Button>
              <Button onClick={() => setShowNew(false)} size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {commands.map((cmd) => (
          <Card key={cmd.name} className="border-border bg-card">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Terminal className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">/{cmd.name}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        cmd.enabled ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cmd.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{cmd.description}</p>
                  <p className="mt-1 text-xs text-secondary-foreground">
                    {"Response: "}
                    {cmd.response.length > 60 ? cmd.response.slice(0, 60) + "..." : cmd.response}
                  </p>
                </div>
              </div>
              <Switch
                checked={cmd.enabled}
                onCheckedChange={(checked) => onToggleCommand(cmd.name, checked)}
                className="data-[state=checked]:bg-accent"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {!isConnected && (
        <p className="text-center text-xs text-muted-foreground">
          Connect the bot first to register slash commands with Discord.
        </p>
      )}
    </div>
  )
}

// ─── Activity Logs ───────────────────────────────────────────────────────────

const logIconMap = { info: Info, success: CheckCircle2, error: XCircle, warning: AlertTriangle }
const logColorMap = { info: "text-primary", success: "text-accent", error: "text-destructive", warning: "text-chart-3" }
const logBgMap = { info: "bg-primary/10", success: "bg-accent/10", error: "bg-destructive/10", warning: "bg-chart-3/10" }

function ActivityLogs({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Activity Logs</h2>
        <p className="mt-1 text-sm text-muted-foreground">View recent bot activity and system events.</p>
      </div>
      <div className="flex flex-col gap-2">
        {logs.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => {
            const Icon = logIconMap[log.type]
            return (
              <Card key={log.id} className="border-border bg-card">
                <CardContent className="flex items-start gap-3 p-3">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${logBgMap[log.type]}`}>
                    <Icon className={`h-4 w-4 ${logColorMap[log.type]}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{log.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Main Dashboard (Page) ───────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Page() {
  const [activeTab, setActiveTab] = useState("config")

  const { data: config } = useSWR<BotConfig>("/api/bot/config", fetcher, { refreshInterval: 5000 })
  const { data: logs } = useSWR<LogEntry[]>("/api/bot/logs", fetcher, { refreshInterval: 3000 })
  const { data: commands } = useSWR<SlashCommand[]>("/api/bot/commands", fetcher, { refreshInterval: 5000 })

  const refreshAll = useCallback(() => {
    mutate("/api/bot/config")
    mutate("/api/bot/logs")
    mutate("/api/bot/commands")
  }, [])

  const handleSaveConfig = useCallback(
    async (update: Partial<BotConfig>) => {
      const res = await fetch("/api/bot/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      })
      if (res.ok) toast.success("Configuration saved")
      else toast.error("Failed to save configuration")
      refreshAll()
    },
    [refreshAll]
  )

  const handleConnect = useCallback(async () => {
    const res = await fetch("/api/bot/connect", { method: "POST" })
    const data = await res.json()
    if (res.ok) toast.success(`Connected as ${data.bot.username}`)
    else toast.error(data.error || "Failed to connect")
    refreshAll()
  }, [refreshAll])

  const handleDisconnect = useCallback(async () => {
    await fetch("/api/bot/connect", { method: "DELETE" })
    toast.success("Bot disconnected")
    refreshAll()
  }, [refreshAll])

  const handleSendMessage = useCallback(
    async (message: string) => {
      const res = await fetch("/api/bot/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (res.ok) toast.success("Message sent successfully")
      else toast.error(data.error || "Failed to send message")
      refreshAll()
    },
    [refreshAll]
  )

  const handleUpdateMessage = useCallback(async (message: string) => {
    await fetch("/api/bot/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
  }, [])

  const handleToggleCommand = useCallback(
    async (name: string, enabled: boolean) => {
      await fetch("/api/bot/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", name, enabled }),
      })
      toast.success(`Command /${name} ${enabled ? "enabled" : "disabled"}`)
      refreshAll()
    },
    [refreshAll]
  )

  const handleAddCommand = useCallback(
    async (command: SlashCommand) => {
      await fetch("/api/bot/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", command }),
      })
      toast.success(`Command /${command.name} created`)
      refreshAll()
    },
    [refreshAll]
  )

  const handleRegisterCommands = useCallback(async () => {
    const res = await fetch("/api/bot/commands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register" }),
    })
    const data = await res.json()
    if (res.ok) toast.success(`${data.count} command(s) registered with Discord`)
    else toast.error(data.error || "Failed to register commands")
    refreshAll()
  }, [refreshAll])

  const defaultConfig: BotConfig = { token: "", guildId: "", channelId: "", message: "", isConnected: false }

  return (
    <div className="flex h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "hsl(228 12% 13%)",
            border: "1px solid hsl(228 10% 20%)",
            color: "hsl(210 20% 92%)",
          },
        }}
      />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto bg-background p-8">
        <div className="mx-auto max-w-3xl">
          {activeTab === "config" && (
            <BotConfigPanel
              config={config || defaultConfig}
              onSave={handleSaveConfig}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          )}
          {activeTab === "messages" && (
            <MessageBuilder
              message={config?.message || ""}
              isConnected={config?.isConnected || false}
              onSendMessage={handleSendMessage}
              onUpdateMessage={handleUpdateMessage}
            />
          )}
          {activeTab === "commands" && (
            <SlashCommandsPanel
              commands={commands || []}
              isConnected={config?.isConnected || false}
              onToggleCommand={handleToggleCommand}
              onAddCommand={handleAddCommand}
              onRegisterCommands={handleRegisterCommands}
            />
          )}
          {activeTab === "logs" && <ActivityLogs logs={logs || []} />}
        </div>
      </main>
    </div>
  )
}
