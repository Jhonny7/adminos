export const path = "https://giz-qa.encodingmx.com/api/v1";

export const sessionTag = "userSessionAdmonOS";
export const emulado = false;

export const environment = {
  production: true,
};

export const paths = {
  login: `${path}/login`,
  menu: `${path}/menu`,
  registeredUsers: `${path}/dashboard/agricola/registered-users`,
  totalSurface: `${path}/dashboard/agricola/total-surface`,
  activeCrops: `${path}/dashboard/agricola/active-crops`,
  irrigatedSurface: `${path}/dashboard/agricola/irrigated-surface`,
  surfaceDistribution: `${path}/dashboard/agricola/surface-distribution`,
  usersByGender: `${path}/dashboard/agricola/users-by-gender`,
  topCropsBySurface: `${path}/dashboard/agricola/top-crops-by-surface`,
  topCropsByProduction: `${path}/dashboard/agricola/top-crops-by-production`,
  laborsRegistered: `${path}/dashboard/labors/labors-registered`,
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
  pesticidesRecordsSummary: `${path}/dashboard/pesticides/records-summary`
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