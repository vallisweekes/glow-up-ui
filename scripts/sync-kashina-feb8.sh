#!/bin/bash
curl -s -X PUT "http://localhost:3000/api/routines/2026-02-08/Kashina" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-08",
    "user": "Kashina",
    "month": "2026-02",
    "morningRoutine": [
      {"id": "morning-1", "text": "Prayers / Affirmations / 5 minute meditation or yoga stretching", "completed": false},
      {"id": "morning-2", "text": "10 / 15 mins listen to Eric Thomas or Les Brown", "completed": false},
      {"id": "morning-3", "text": "Oil pulling", "completed": false},
      {"id": "morning-4", "text": "Drink clove tea (on an empty stomach)", "completed": false}
    ],
    "healthHabits": [
      {"id": "health-1", "text": "Drink 8-10 cups of water", "completed": false},
      {"id": "health-2", "text": "Take supplements", "completed": false},
      {"id": "health-3", "text": "No sugar or unhealthy snacking", "completed": false},
      {"id": "health-4", "text": "Limited / no alcohol", "completed": false},
      {"id": "health-6", "text": "Teeth whitening strips", "completed": false}
    ],
    "nightRoutine": [
      {"id": "night-1", "text": "Nightly prayers/affirmations", "completed": false},
      {"id": "night-2", "text": "Gratitude or reflection moment", "completed": false}
    ],
    "nutrition": {"breakfast": "", "lunch": "", "dinner": ""},
    "pushUpsCount": 0,
    "stepsCount": 0
  }'
