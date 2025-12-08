import { Browser, browser } from '#imports'

import { TicketService } from '@/services/ticket-service'
import { getLogger } from '~/utils/logger'

export interface AlarmConfig {
  name: string
  periodInMinutes: number
  handler: () => Promise<void>
}

export class BackgroundAlarmsService {
  private alarms: AlarmConfig[] = []
  private readonly boundHandleAlarm = this.handleAlarm.bind(this)
  private log = getLogger('background-alarms')

  constructor(private ticketService: TicketService) {
    this.setupAlarms()
  }

  private setupAlarms() {
    this.alarms = [
      {
        name: 'refresh-recent-tickets',
        periodInMinutes: 10,
        handler: this.refreshRecentTickets.bind(this)
      }
    ]
  }

  async initialize() {
    // Clear existing alarms
    await this.clearAllAlarms()

    // Set up alarm listeners
    browser.alarms.onAlarm.addListener(this.boundHandleAlarm)

    // Create alarms
    for (const alarm of this.alarms) {
      await browser.alarms.create(alarm.name, {
        periodInMinutes: alarm.periodInMinutes
      })
      this.log.info(
        `Created alarm: ${alarm.name} (${alarm.periodInMinutes}min)`
      )
    }

    // Run initial data refresh
    await this.runInitialRefresh()
  }

  private async handleAlarm(alarm: Browser.alarms.Alarm) {
    const alarmConfig = this.alarms.find((a) => a.name === alarm.name)
    if (!alarmConfig) {
      this.log.warn(`Unknown alarm: ${alarm.name}`)
      return
    }

    try {
      // Check if authentication is configured
      const hasValidConfig = await this.ticketService.isConfigured()
      if (!hasValidConfig) {
        this.log.info(`Skipping ${alarm.name} - authentication not configured`)
        return
      }

      this.log.info(`Running alarm: ${alarm.name}`)
      await alarmConfig.handler()
      this.log.info(`Completed alarm: ${alarm.name}`)
    } catch (error) {
      this.log.error(`Error in alarm ${alarm.name}:`, error)
    }
  }

  private async refreshRecentTickets() {
    await this.ticketService.suggestions.refresh('alarm')
  }

  private async runInitialRefresh() {
    const hasValidConfig = await this.ticketService.isConfigured()
    if (!hasValidConfig) {
      this.log.info('Skipping initial refresh - authentication not configured')
      return
    }

    this.log.info('Running initial data refresh...')

    try {
      await Promise.all([this.refreshRecentTickets()])
      this.log.info('Initial data refresh completed')
    } catch (error) {
      this.log.error('Error during initial refresh:', error)
    }
  }

  private async clearAllAlarms() {
    const existingAlarms = await browser.alarms.getAll()
    for (const alarm of existingAlarms) {
      if (this.alarms.some((a) => a.name === alarm.name)) {
        await browser.alarms.clear(alarm.name)
      }
    }
  }

  async destroy() {
    await this.clearAllAlarms()
    browser.alarms.onAlarm.removeListener(this.boundHandleAlarm)
  }
}
