export const path = "https://giz-qa.encodingmx.com/api/v1";

export const sessionTag = "userSessionAdmonOS";
export const emulado = false;

export const environment = {
  production: true,
};

export const paths = {
  login: `${path}/login`,
  menu: `${path}/menu`,
  laborsRegistered: `${path}/dashboard/labors/labors-registered`,
  estates: `${path}/dashboard/estates`,
  estatesCatalogs: `${path}/dashboard/estates/catalogs`,
  estatesList: `${path}/dashboard/estates`,
  estatesWithLabors: `${path}/dashboard/labors/estates-with-labors`,
  surfaceWithLabors: `${path}/dashboard/labors/surface-with-labors`,
  conservationPractices: `${path}/dashboard/labors/conservation-practices`,
  laborsDistributionByType: `${path}/dashboard/labors/distribution-by-type`,
  laborsMonthlyActivity: `${path}/dashboard/labors/monthly-activity`,
  laborsConservationAdoption: `${path}/dashboard/labors/conservation-adoption`,
  pesticidesSurfaceWithPesticides: `${path}/dashboard/pesticides/surface-with-pesticides`,
  pesticidesUsagePercentage: `${path}/dashboard/pesticides/usage-percentage`,
  pesticidesProducersReporting: `${path}/dashboard/pesticides/producers-reporting`,
  pesticidesToxicologyRecords: `${path}/dashboard/pesticides/toxicology-records`,
  pesticidesUsageByType: `${path}/dashboard/pesticides/usage-by-type`,
  pesticidesToxicologyDistribution: `${path}/dashboard/pesticides/toxicology-distribution`,
  pesticidesUsageByGender: `${path}/dashboard/pesticides/usage-by-gender`,
  pesticidesRecordsSummary: `${path}/dashboard/pesticides/records-summary`,
  filterEstados: `${path}/sepomex/states`,
  filterMunicipiosBase: `${path}/sepomex/states`,
  catalogsDashboard: `${path}/catalogs-dashboard`,
  // Costos y Rendimientos
  averageYield: `${path}/dashboard/cost/average-yield`,
  totalCostPerHectare: `${path}/dashboard/cost/total-cost-per-hectare`,
  grossMarginPerHectare: `${path}/dashboard/cost/gross-margin-per-hectare`,
  benefitCostRatio: `${path}/dashboard/cost/benefit-cost-ratio`,
  salePrice: `${path}/dashboard/cost/sale-price`,
  yieldByMunicipality: `${path}/dashboard/cost/yield-by-municipality`,
  yieldByHumidity: `${path}/dashboard/cost/yield-by-humidity`,
  topCropsYield: `${path}/dashboard/cost/top-crops-yield`,
  costYieldEvolution: `${path}/dashboard/cost/cost-yield-evolution`,
  analysisTable: `${path}/dashboard/cost/analysis-table`
}

export const themeData = {
  black: {
    border: "#e8ecf0",
    color: "#516173",
    alert_class: "black",
    background: "#ffffff"
  }
}

export const events = {
  OPEN_MENU: 'OPEN_MENU'
}