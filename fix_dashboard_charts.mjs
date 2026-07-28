import fs from "fs";

const filePath = "college_template/fixtures/dashboard_chart.json";
const content = fs.readFileSync(filePath, "utf8");
const charts = JSON.parse(content);

const before = charts.length;
let fixed = 0;

for (const chart of charts) {
  // For Count/Sum/Average charts: time_series_based_on is required
  if (["Count", "Sum", "Average"].includes(chart.chart_type)) {
    if (!chart.time_series_based_on) {
      console.log(`  ${chart.name}: Missing time_series_based_on for ${chart.chart_type} chart!`);
      chart.time_series_based_on = "creation"; // fallback
      fixed++;
    }
  }

  // For Group By charts: group_by_based_on is required
  if (chart.chart_type === "Group By") {
    if (!chart.group_by_based_on) {
      // Infer group_by_based_on from document_type or based_on
      // Default to "status" which is a common grouping field
      chart.group_by_based_on = chart.based_on || "status";
      console.log(`  ${chart.name}: Set group_by_based_on to "${chart.group_by_based_on}"`);
      fixed++;
    }
    
    if (!chart.aggregate_function_based_on && chart.aggregate_function_type) {
      chart.aggregate_function_based_on = chart.based_on || chart.group_by_based_on;
      console.log(`  ${chart.name}: Set aggregate_function_based_on to "${chart.aggregate_function_based_on}"`);
      fixed++;
    }
    
    if (!chart.group_by_type) {
      chart.group_by_type = "Count";
      console.log(`  ${chart.name}: Set group_by_type to "Count"`);
      fixed++;
    }
  }

  // Ensure number_of_groups is set
  if (!chart.number_of_groups && chart.number_of_groups !== 0) {
    chart.number_of_groups = 0;
  }

  // Ensure is_public is set
  if (chart.is_public === undefined || chart.is_public === null) {
    chart.is_public = 1;
  }

  // Ensure timespan is set for Count charts
  if (["Count", "Sum", "Average"].includes(chart.chart_type) && !chart.timespan) {
    chart.timespan = "Monthly";
    fixed++;
  }
  
  // Ensure time_granularity is set
  if (!chart.time_granularity) {
    chart.time_granularity = "Monthly";
    fixed++;
  }

  // Ensure type (the chart type field) is set properly
  if (chart.type && !chart.chart_type) {
    chart.chart_type = chart.type;
  } else if (!chart.type) {
    chart.type = chart.chart_type || "Count";
  }
}

if (fixed > 0) {
  fs.writeFileSync(filePath, JSON.stringify(charts, null, 2));
  console.log(`\n✅ Fixed ${fixed} charts in ${filePath}`);
} else {
  console.log(`\n✅ All ${before} charts look clean`);
}

// Show final state
console.log("\n=== Final Chart State ===");
for (const chart of charts) {
  console.log(`  ${chart.name}: type=${chart.chart_type} | gbb=${chart.group_by_based_on || '-'} | ts=${chart.time_series_based_on || '-'} | gbt=${chart.group_by_type || '-'}`);
}
