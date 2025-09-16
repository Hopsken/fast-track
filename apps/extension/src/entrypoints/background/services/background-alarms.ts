import { TicketService } from '@/services/ticket-service'

export interface AlarmConfig {
  name: string
  periodInMinutes: number
  handler: () => Promise<void>
}

export class BackgroundAlarmsService {
  private alarms: AlarmConfig[] = []

  constructor(private ticketService: TicketService) {
    this.setupAlarms()
  }

  private setupAlarms() {
    this.alarms = [
      {
        name: 'refresh-recent-tickets',
        periodInMinutes: 15,
        handler: this.refreshRecentTickets.bind(this)
      }
    ]
  }

  async initialize() {
    // Clear existing alarms
    await this.clearAllAlarms()

    // Set up alarm listeners
    chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this))

    // Create alarms
    for (const alarm of this.alarms) {
      await chrome.alarms.create(alarm.name, {
        periodInMinutes: alarm.periodInMinutes
      })
      console.info(`Created alarm: ${alarm.name} (${alarm.periodInMinutes}min)`)
    }

    // Run initial data refresh
    await this.runInitialRefresh()
  }

  private async handleAlarm(alarm: chrome.alarms.Alarm) {
    const alarmConfig = this.alarms.find((a) => a.name === alarm.name)
    if (!alarmConfig) {
      console.warn(`Unknown alarm: ${alarm.name}`)
      return
    }

    try {
      // Check if authentication is configured
      if (!this.ticketService.hasValidConfig()) {
        console.info(`Skipping ${alarm.name} - authentication not configured`)
        return
      }

      console.info(`Running alarm: ${alarm.name}`)
      await alarmConfig.handler()
      console.info(`Completed alarm: ${alarm.name}`)
    } catch (error) {
      console.error(`Error in alarm ${alarm.name}:`, error)
    }
  }

  private async refreshRecentTickets() {
    await this.ticketService.loadSuggestions()
  }

  private async runInitialRefresh() {
    if (!this.ticketService.hasValidConfig()) {
      console.info('Skipping initial refresh - authentication not configured')
      return
    }

    console.info('Running initial data refresh...')

    try {
      await Promise.all([this.refreshRecentTickets()])
      console.info('Initial data refresh completed')
    } catch (error) {
      console.error('Error during initial refresh:', error)
    }
  }

  private async clearAllAlarms() {
    const existingAlarms = await chrome.alarms.getAll()
    for (const alarm of existingAlarms) {
      if (this.alarms.some((a) => a.name === alarm.name)) {
        await chrome.alarms.clear(alarm.name)
      }
    }
  }

  async destroy() {
    await this.clearAllAlarms()
    chrome.alarms.onAlarm.removeListener(this.handleAlarm.bind(this))
  }
}
