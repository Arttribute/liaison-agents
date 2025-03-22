import { subHours, subDays, subMonths } from "date-fns";

// Generate sample usage data based on the selected time span
export function generateUsageData(timeSpan: string) {
  const now = new Date();
  const data: Array<{ date: string; value: number }> = [];

  switch (timeSpan) {
    case "24h":
      // Generate hourly data for the last 24 hours
      for (let i = 24; i >= 0; i--) {
        const date = subHours(now, i);
        const value = Math.floor(Math.random() * 500) + 100; // Random value between 100 and 600
        data.push({
          date: date.toISOString(),
          value,
        });
      }
      break;

    case "7d":
      // Generate daily data for the last 7 days
      for (let i = 7; i >= 0; i--) {
        const date = subDays(now, i);
        const value = Math.floor(Math.random() * 3000) + 1000; // Random value between 1000 and 4000
        data.push({
          date: date.toISOString(),
          value,
        });
      }
      break;

    case "30d":
      // Generate data for the last 30 days (every 2 days)
      for (let i = 30; i >= 0; i -= 2) {
        const date = subDays(now, i);
        const value = Math.floor(Math.random() * 5000) + 3000; // Random value between 3000 and 8000
        data.push({
          date: date.toISOString(),
          value,
        });
      }
      break;

    case "3m":
      // Generate weekly data for the last 3 months
      for (let i = 12; i >= 0; i--) {
        const date = subDays(now, i * 7);
        const value = Math.floor(Math.random() * 20000) + 10000; // Random value between 10000 and 30000
        data.push({
          date: date.toISOString(),
          value,
        });
      }
      break;

    case "12m":
      // Generate monthly data for the last 12 months
      for (let i = 12; i >= 0; i--) {
        const date = subMonths(now, i);
        const value = Math.floor(Math.random() * 80000) + 40000; // Random value between 40000 and 120000
        data.push({
          date: date.toISOString(),
          value,
        });
      }
      break;

    case "24m":
      // Generate data for the last 24 months (every 2 months)
      for (let i = 24; i >= 0; i -= 2) {
        const date = subMonths(now, i);
        const value = Math.floor(Math.random() * 150000) + 80000; // Random value between 80000 and 230000
        data.push({
          date: date.toISOString(),
          value,
        });
      }
      break;

    default:
      // Default to 7 days
      for (let i = 7; i >= 0; i--) {
        const date = subDays(now, i);
        const value = Math.floor(Math.random() * 3000) + 1000;
        data.push({
          date: date.toISOString(),
          value,
        });
      }
  }

  return data;
}

// Sample tool names with more realistic IDs
const toolNames = [
  { name: "database_query", id: "tool_db_query_v1" },
  { name: "payment_gateway", id: "tool_payment_v2" },
  { name: "notification_service", id: "tool_notify_v1" },
  { name: "user_service", id: "tool_user_mgmt_v3" },
  { name: "inventory_service", id: "tool_inventory_v2" },
  { name: "data_aggregator", id: "tool_data_agg_v1" },
  { name: "pdf_generator", id: "tool_pdf_gen_v2" },
  { name: "email_service", id: "tool_email_v4" },
  { name: "authentication_service", id: "tool_auth_v3" },
  { name: "search_service", id: "tool_search_v2" },
  { name: "recommendation_engine", id: "tool_rec_engine_v1" },
  { name: "image_processor", id: "tool_img_proc_v2" },
  { name: "file_storage", id: "tool_file_store_v3" },
  { name: "analytics_service", id: "tool_analytics_v1" },
  { name: "translation_service", id: "tool_translate_v2" },
];

// Generate sample tools usage data
export function generateToolsData(timeSpan: string) {
  // Scale factor based on time span to make the numbers realistic
  let scaleFactor = 1;
  switch (timeSpan) {
    case "24h":
      scaleFactor = 1;
      break;
    case "7d":
      scaleFactor = 7;
      break;
    case "30d":
      scaleFactor = 30;
      break;
    case "3m":
      scaleFactor = 90;
      break;
    case "12m":
      scaleFactor = 365;
      break;
    case "24m":
      scaleFactor = 730;
      break;
    default:
      scaleFactor = 7;
  }

  return toolNames.map((tool) => {
    // Generate random but realistic statistics
    const calls =
      Math.floor(Math.random() * 1000 * scaleFactor) + 100 * scaleFactor;
    const successRate = Math.random() * 0.3 + 0.7; // Between 70% and 100%
    const errorRate = Math.random() * 0.1; // Between 0% and 10%
    const warningRate = 1 - successRate - errorRate; // Remaining percentage

    return {
      id: tool.id,
      name: tool.name,
      calls,
      avgDuration: Math.floor(Math.random() * 500) + 50, // Between 50ms and 550ms
      successRate,
      errorRate,
      warningRate,
    };
  });
}
