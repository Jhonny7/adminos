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
  topCropsByProduction: `${path}/dashboard/agricola/top-crops-by-production`
}

export const themeData = {
  black: {
    border: "#f2f2f2",
    color: "#fff",
    alert_class: "black",
    background: "#383838"
  }
}

export const events = {
  OPEN_MENU: 'OPEN_MENU'
}