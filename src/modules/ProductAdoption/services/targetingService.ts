import {
  DeviceRule,
  PageRule,
  ScheduleRule,
  SegmentCondition,
  ServiceResponse,
  TourTargeting,
  UserContext,
  UserSegment,
  WidgetTargeting,
} from '../types';

export class TargetingService {
  /**
   * Check if a user matches the targeting criteria for a tour
   */
  async checkTourTargeting(
    targeting: TourTargeting,
    userContext: UserContext
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Check anonymous users
      if (!userContext.id && !targeting.includeAnonymous) {
        return {
          success: true,
          data: false,
        };
      }

      // Check if user has already completed the tour
      if (targeting.excludeCompletedUsers) {
        // This would check against tour progress data
        // For now, we'll skip this check
      }

      // Check date range
      if (targeting.dateRange) {
        const now = new Date();
        if (
          (targeting.dateRange.start && now < targeting.dateRange.start) ||
          (targeting.dateRange.end && now > targeting.dateRange.end)
        ) {
          return {
            success: true,
            data: false,
          };
        }
      }

      // Check user segments
      if (targeting.segments.length > 0) {
        const segmentMatch = await this.checkUserSegments(
          targeting.segments,
          userContext
        );
        if (!segmentMatch) {
          return {
            success: true,
            data: false,
          };
        }
      }

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error checking tour targeting:', error);
      return {
        success: false,
        error: {
          code: 'TARGETING_ERROR',
          message: 'Failed to check tour targeting',
          details: error,
        },
      };
    }
  }

  /**
   * Check if a user matches the targeting criteria for a widget
   */
  async checkWidgetTargeting(
    targeting: WidgetTargeting,
    userContext: UserContext,
    currentUrl: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Check page rules
      if (targeting.pages.length > 0) {
        const pageMatch = this.checkPageRules(targeting.pages, currentUrl);
        if (!pageMatch) {
          return {
            success: true,
            data: false,
          };
        }
      }

      // Check device rules
      if (targeting.devices && targeting.devices.length > 0) {
        const deviceMatch = this.checkDeviceRules(targeting.devices);
        if (!deviceMatch) {
          return {
            success: true,
            data: false,
          };
        }
      }

      // Check schedule
      if (targeting.schedule) {
        const scheduleMatch = this.checkScheduleRule(targeting.schedule);
        if (!scheduleMatch) {
          return {
            success: true,
            data: false,
          };
        }
      }

      // Check audience rules
      if (targeting.audience.length > 0) {
        const audienceMatch = await this.checkAudienceRules(
          targeting.audience,
          userContext
        );
        if (!audienceMatch) {
          return {
            success: true,
            data: false,
          };
        }
      }

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error checking widget targeting:', error);
      return {
        success: false,
        error: {
          code: 'WIDGET_TARGETING_ERROR',
          message: 'Failed to check widget targeting',
          details: error,
        },
      };
    }
  }

  /**
   * Check if user matches any of the segments
   */
  private async checkUserSegments(
    segments: UserSegment[],
    userContext: UserContext
  ): Promise<boolean> {
    for (const segment of segments) {
      const matches = await this.evaluateSegment(segment, userContext);
      if (matches) {
        return true;
      }
    }
    return false;
  }

  /**
   * Evaluate if a user matches a specific segment
   */
  private async evaluateSegment(
    segment: UserSegment,
    userContext: UserContext
  ): Promise<boolean> {
    const conditionResults = await Promise.all(
      segment.conditions.map((condition) =>
        this.evaluateCondition(condition, userContext)
      )
    );

    if (segment.operator === 'AND') {
      return conditionResults.every((result) => result);
    } else {
      return conditionResults.some((result) => result);
    }
  }

  /**
   * Evaluate a single segment condition
   */
  private async evaluateCondition(
    condition: SegmentCondition,
    userContext: UserContext
  ): Promise<boolean> {
    const userValue = this.getUserProperty(condition.property, userContext);

    switch (condition.operator) {
      case 'equals':
        return userValue === condition.value;
      case 'not-equals':
        return userValue !== condition.value;
      case 'contains':
        return String(userValue).includes(String(condition.value));
      case 'greater-than':
        return Number(userValue) > Number(condition.value);
      case 'less-than':
        return Number(userValue) < Number(condition.value);
      default:
        return false;
    }
  }

  /**
   * Get a property value from the user context
   */
  private getUserProperty(property: string, userContext: UserContext): unknown {
    // Handle nested properties with dot notation
    const parts = property.split('.');
    let value: unknown = userContext;

    for (const part of parts) {
      value = (value as Record<string, unknown>)?.[part];
      if (value === undefined) {
        break;
      }
    }

    return value;
  }

  /**
   * Check if current URL matches page rules
   */
  private checkPageRules(rules: PageRule[], currentUrl: string): boolean {
    for (const rule of rules) {
      if (rule.type === 'all') {
        return true;
      }

      const urlToCheck =
        rule.type === 'url' ? currentUrl : new URL(currentUrl).pathname;

      switch (rule.operator) {
        case 'equals':
          if (urlToCheck === rule.value) return true;
          break;
        case 'contains':
          if (urlToCheck.includes(rule.value)) return true;
          break;
        case 'starts-with':
          if (urlToCheck.startsWith(rule.value)) return true;
          break;
        case 'regex':
          if (new RegExp(rule.value).test(urlToCheck)) return true;
          break;
      }
    }
    return false;
  }

  /**
   * Check if current device matches device rules
   */
  private checkDeviceRules(rules: DeviceRule[]): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    for (const rule of rules) {
      let typeMatch = false;

      switch (rule.type) {
        case 'mobile':
          typeMatch = isMobile;
          break;
        case 'tablet':
          typeMatch = isTablet;
          break;
        case 'desktop':
          typeMatch = isDesktop;
          break;
      }

      if (!typeMatch) continue;

      // Check OS if specified
      if (rule.os && rule.os.length > 0) {
        const osMatch = rule.os.some((os) =>
          userAgent.includes(os.toLowerCase())
        );
        if (!osMatch) continue;
      }

      // Check browser if specified
      if (rule.browser && rule.browser.length > 0) {
        const browserMatch = rule.browser.some((browser) =>
          userAgent.includes(browser.toLowerCase())
        );
        if (!browserMatch) continue;
      }

      return true;
    }

    return false;
  }

  /**
   * Check if current time matches schedule rule
   */
  private checkScheduleRule(schedule: ScheduleRule): boolean {
    const now = new Date();

    // Check date range
    if (schedule.startDate && now < schedule.startDate) {
      return false;
    }
    if (schedule.endDate && now > schedule.endDate) {
      return false;
    }

    // Check day of week
    if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      const currentDay = now.getDay();
      if (!schedule.daysOfWeek.includes(currentDay)) {
        return false;
      }
    }

    // Check hour of day
    if (schedule.hoursOfDay && schedule.hoursOfDay.length > 0) {
      const currentHour = now.getHours();
      if (!schedule.hoursOfDay.includes(currentHour)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check audience rules
   */
  private async checkAudienceRules(
    rules: unknown[],
    userContext: UserContext
  ): Promise<boolean> {
    for (const rule of rules) {
      const ruleObj = rule as Record<string, unknown>;
      if (ruleObj.type === 'all') {
        return true;
      }

      if (ruleObj.type === 'segment' && ruleObj.segmentId) {
        // Check if user belongs to segment
        if (userContext.segments?.includes(ruleObj.segmentId as string)) {
          return true;
        }
      }

      if (ruleObj.type === 'user-property') {
        const userValue = this.getUserProperty(
          ruleObj.property as string,
          userContext
        );
        const matches = this.compareValues(
          userValue,
          ruleObj.operator as string,
          ruleObj.value
        );
        if (matches) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Compare values based on operator
   */
  private compareValues(
    value: unknown,
    operator: string,
    targetValue: unknown
  ): boolean {
    switch (operator) {
      case 'is':
        return value === targetValue;
      case 'is-not':
        return value !== targetValue;
      case 'contains':
        return String(value).includes(String(targetValue));
      case 'greater-than':
        return Number(value) > Number(targetValue);
      case 'less-than':
        return Number(value) < Number(targetValue);
      default:
        return false;
    }
  }
}

// Export singleton instance
export const targetingService = new TargetingService();
