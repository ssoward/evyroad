#!/bin/bash

# EvyRoad Health Monitor Script
# Run this script periodically to monitor application health

SERVER_IP="34.202.160.77"
LOG_FILE="/var/log/evyroad-monitor.log"
EMAIL="your-email@example.com"  # Update with your email

echo "$(date): Starting health check..." >> $LOG_FILE

# Check frontend
if curl -f -s http://$SERVER_IP/ >/dev/null 2>&1; then
    echo "$(date): Frontend OK" >> $LOG_FILE
else
    echo "$(date): Frontend FAILED" >> $LOG_FILE
    # Send alert email here
fi

# Check API health
if curl -f -s http://$SERVER_IP/health >/dev/null 2>&1; then
    echo "$(date): API OK" >> $LOG_FILE
else
    echo "$(date): API FAILED" >> $LOG_FILE
    # Send alert email here
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "$(date): Disk usage high: ${DISK_USAGE}%" >> $LOG_FILE
    # Send alert email here
fi

echo "$(date): Health check completed" >> $LOG_FILE
