#!/bin/bash

# 设置进程名
PROCESS_NAME="Interview"

# 查找所有匹配的进程ID
PIDS=$(pgrep -f "$PROCESS_NAME")

if [ -z "$PIDS" ]; then
    echo "No processes named '$PROCESS_NAME' found."
    exit 0
else
    echo "Found processes named '$PROCESS_NAME':"
    echo "$PIDS"

    # 杀掉所有匹配的进程
    kill -9 $PIDS 2>/dev/null

    # 检查是否成功杀掉
    if [ $? -eq 0 ]; then
        echo "Successfully killed all '$PROCESS_NAME' processes."
    else
        echo "Failed to kill some processes. Try running with sudo."
        exit 1
    fi
fi