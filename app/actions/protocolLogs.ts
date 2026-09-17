'use server';

import { ProtocolLog } from '@/types/protocols';

const MAX_LOGS = 50;

let MOCK_PROTOCOL_LOGS: ProtocolLog[] = [
  {
    id: 'log_1',
    protocol_id: 'proto_1',
    protocol_title: 'Morning Ceiling Lift Transfer (Bed to Power Chair)',
    category: 'transfer',
    scheduled_time: '08:00 AM',
    completed_at: new Date(Date.now() - 18000000).toISOString(),
    duration_minutes: 25,
    performed_by_id: 'attendant_1',
    performed_by_name: 'Sarah Jenkins',
    assist_type: '1-person-assist',
    status: 'completed',
    equipment_used: {
      device_name: 'Arjo Maxi Sky 440 Ceiling Lift',
      sling_model_size: 'Medium Mesh High-Back',
      strap_loop_settings: 'Green Shoulder / Yellow Legs, Crossed',
      power_chair_powered_off: true
    },
    vital_and_physical_checks: {
      skin_check_performed: true,
      skin_condition: 'intact',
      skin_notes: 'Skin clear and warm. Pressure points well-padded.',
      comfort_rating: 5,
      spasms_experienced: false
    },
    attendant_notes: 'Transfer went smoothly. Employer alert and in good spirits.',
    employer_acknowledged: true,
    created_at: new Date(Date.now() - 18000000).toISOString()
  },
  {
    id: 'log_2',
    protocol_id: 'proto_2',
    protocol_title: 'Intermittent Catheterization & Bladder Care',
    category: 'medical_care',
    scheduled_time: '11:30 AM',
    completed_at: new Date(Date.now() - 7200000).toISOString(),
    duration_minutes: 15,
    performed_by_id: 'attendant_1',
    performed_by_name: 'Sarah Jenkins',
    assist_type: '1-person-assist',
    status: 'completed',
    equipment_used: {
      device_name: 'Coloplast SpeediCath 14Fr'
    },
    vital_and_physical_checks: {
      skin_check_performed: true,
      skin_condition: 'intact',
      comfort_rating: 4,
      spasms_experienced: false
    },
    attendant_notes: 'Output 400ml clear pale yellow urine. Procedure completed cleanly.',
    employer_acknowledged: false,
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'log_3',
    protocol_id: 'proto_3',
    protocol_title: '2-Hour Pressure Relief Turn & Repositioning',
    category: 'positioning',
    scheduled_time: '01:30 PM',
    completed_at: new Date(Date.now() - 3600000).toISOString(),
    duration_minutes: 10,
    performed_by_id: 'attendant_2',
    performed_by_name: 'Marcus Vance',
    assist_type: '1-person-assist',
    status: 'completed',
    vital_and_physical_checks: {
      skin_check_performed: true,
      skin_condition: 'redness_noted',
      skin_notes: 'Minor pinkness on left ischial tuberosity. Repositioned with gel wedge.',
      comfort_rating: 3,
      spasms_experienced: true
    },
    exception_reason: 'Mild flexor spasm during shift; resolved with 2-minute relaxation.',
    attendant_notes: 'Noted mild pinkness. Will monitor at next repositioning.',
    employer_acknowledged: true,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

export async function logProtocolExecution(data: Partial<ProtocolLog>): Promise<ProtocolLog> {
  try {
    const newLog: ProtocolLog = {
      id: `log_${Date.now()}`,
      protocol_id: data.protocol_id || 'proto_custom',
      protocol_title: data.protocol_title || 'Custom Care Routine',
      category: data.category || 'transfer',
      scheduled_time: data.scheduled_time || '09:00 AM',
      completed_at: data.completed_at || new Date().toISOString(),
      duration_minutes: data.duration_minutes || 20,
      performed_by_id: data.performed_by_id || 'attendant_1',
      performed_by_name: data.performed_by_name || 'Sarah Jenkins',
      assist_type: data.assist_type || '1-person-assist',
      status: data.status || 'completed',
      equipment_used: data.equipment_used || {},
      vital_and_physical_checks: data.vital_and_physical_checks || {},
      exception_reason: data.exception_reason,
      attendant_notes: data.attendant_notes || '',
      employer_acknowledged: false,
      created_at: new Date().toISOString()
    };

    MOCK_PROTOCOL_LOGS.unshift(newLog);
    if (MOCK_PROTOCOL_LOGS.length > MAX_LOGS) {
      MOCK_PROTOCOL_LOGS = MOCK_PROTOCOL_LOGS.slice(0, MAX_LOGS);
    }
    return newLog;
  } catch (err) {
    console.error('logProtocolExecution error:', err);
    throw new Error('Failed to log protocol execution');
  }
}

export async function getProtocolLogsByDate(dateString: string): Promise<ProtocolLog[]> {
  try {
    return [...MOCK_PROTOCOL_LOGS];
  } catch (err) {
    console.error('getProtocolLogsByDate error:', err);
    return [];
  }
}

export async function getProtocolComplianceSummary(dateString: string) {
  try {
    const logs = MOCK_PROTOCOL_LOGS;
    const total = logs.length;
    const completed = logs.filter(l => l.status === 'completed').length;
    const skipped = logs.filter(l => l.status === 'skipped' || l.status === 'partially_completed').length;
    const skinAlerts = logs.filter(l => l.vital_and_physical_checks?.skin_condition && l.vital_and_physical_checks.skin_condition !== 'intact').length;
    const spasmsNoted = logs.filter(l => l.vital_and_physical_checks?.spasms_experienced).length;

    return {
      totalScheduled: total + 1,
      completedCount: completed,
      skippedCount: skipped,
      compliancePercentage: Math.round((completed / (total || 1)) * 100),
      skinAlertsCount: skinAlerts,
      spasmsCount: spasmsNoted
    };
  } catch (err) {
    console.error('getProtocolComplianceSummary error:', err);
    return {
      totalScheduled: 0,
      completedCount: 0,
      skippedCount: 0,
      compliancePercentage: 100,
      skinAlertsCount: 0,
      spasmsCount: 0
    };
  }
}

export async function acknowledgeProtocolLog(logId: string): Promise<boolean> {
  try {
    const index = MOCK_PROTOCOL_LOGS.findIndex(l => l.id === logId);
    if (index !== -1) {
      MOCK_PROTOCOL_LOGS[index].employer_acknowledged = true;
      return true;
    }
    return false;
  } catch (err) {
    console.error('acknowledgeProtocolLog error:', err);
    return false;
  }
}

export async function exportProtocolAudit(startDate: string, endDate: string) {
  try {
    return {
      exportDate: new Date().toISOString(),
      range: { startDate, endDate },
      totalLogs: MOCK_PROTOCOL_LOGS.length,
      logs: [...MOCK_PROTOCOL_LOGS]
    };
  } catch (err) {
    console.error('exportProtocolAudit error:', err);
    return {
      exportDate: new Date().toISOString(),
      range: { startDate, endDate },
      totalLogs: 0,
      logs: []
    };
  }
}
