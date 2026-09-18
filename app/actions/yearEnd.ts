'use server';

export interface T4Data {
  box14_gross_income: number;
  box16_cpp_contributions: number;
  box18_ei_premiums: number;
  box22_income_tax: number;
}

export interface ROEData {
  block15A_insurable_hours: number;
  block15B_insurable_earnings: number;
}

// In-Memory T4 database seeded with realistic Direct Funding values
const SEEDED_T4_DATABASE: Record<string, T4Data> = {
  'psw_elena_02': {
    box14_gross_income: 34210.00,
    box16_cpp_contributions: 1845.20,
    box18_ei_premiums: 584.10,
    box22_income_tax: 3210.50
  },
  'att_2': {
    box14_gross_income: 18240.00,
    box16_cpp_contributions: 924.50,
    box18_ei_premiums: 292.12,
    box22_income_tax: 1250.00
  },
  'att_3': {
    box14_gross_income: 8450.00,
    box16_cpp_contributions: 412.30,
    box18_ei_premiums: 135.20,
    box22_income_tax: 480.00
  }
};

// In-Memory ROE database for Service Canada Block 15A/15B
const SEEDED_ROE_DATABASE: Record<string, ROEData> = {
  'psw_elena_02': {
    block15A_insurable_hours: 1455.5,
    block15B_insurable_earnings: 34210.00
  },
  'att_2': {
    block15A_insurable_hours: 776.0,
    block15B_insurable_earnings: 18240.00
  },
  'att_3': {
    block15A_insurable_hours: 352.0,
    block15B_insurable_earnings: 8450.00
  }
};

export async function generateT4Data(
  employerId: string,
  attendantId: string,
  taxYear: number
): Promise<{ data: T4Data | null; error?: string }> {
  try {
    const data = SEEDED_T4_DATABASE[attendantId] || {
      box14_gross_income: 12000.00,
      box16_cpp_contributions: 610.00,
      box18_ei_premiums: 192.00,
      box22_income_tax: 850.00
    };

    return {
      data: {
        ...data,
        // Adjust slightly based on the tax year for realism
        box14_gross_income: taxYear === 2025 ? data.box14_gross_income * 0.95 : data.box14_gross_income
      }
    };
  } catch (error: any) {
    console.error("Error generating T4 Data:", error);
    return {
      data: null,
      error: error.message || "Failed to generate T4 Data."
    };
  }
}

export async function generateROEData(
  employerId: string,
  attendantId: string
): Promise<{ data: ROEData | null; error?: string }> {
  try {
    const data = SEEDED_ROE_DATABASE[attendantId] || {
      block15A_insurable_hours: 300.0,
      block15B_insurable_earnings: 7000.00
    };

    return {
      data
    };
  } catch (error: any) {
    console.error("Error generating ROE Data:", error);
    return {
      data: null,
      error: error.message || "Failed to generate ROE Data."
    };
  }
}
