export const path = "https://giz-qa.encodingmx.com/api/v1";
export const pecuarioPath = "https://giz-qa.encodingmx.com/api/pecuario";
export const infraestructuraPath = "https://giz-qa.encodingmx.com/api/infraestructura";
export const ranchoPath = "https://giz-qa.encodingmx.com/api/rancho";
export const usoSueloPath = "https://giz-qa.encodingmx.com/api/uso-suelo";
export const sanidadPath = "https://giz-qa.encodingmx.com/api/sanidad";

export const sessionTag = "userSessionAdmonOS";
export const emulado = false;

export const environment = {
  production: true,
};

export const paths = {
  login: `${path}/login`,
  menu: `${path}/menu`,
  pecuarioResumen: `${pecuarioPath}/resumen`,
  pecuarioCabezasVientres: `${pecuarioPath}/cabezas-vientres`,
  pecuarioRazas: `${pecuarioPath}/razas`,
  pecuarioUpp: `${pecuarioPath}/upp`,
  pecuarioTipoPersona: `${pecuarioPath}/upp/tipo-persona`,
  pecuarioTrazabilidad: `${pecuarioPath}/trazabilidad`,
  pecuarioSanidad: `${pecuarioPath}/sanidad`,
  pecuarioPropiedad: `${pecuarioPath}/propiedad`,
  pecuarioOrganismos: `${pecuarioPath}/organismos-ganaderos`,
  pecuarioComparacionPgn: `${pecuarioPath}/comparacion-pgn`,
  pecuarioExport: `${pecuarioPath}/export`,
  pecuarioCacheFlush: `${pecuarioPath}/cache/flush`,
  infraestructuraResumen: `${infraestructuraPath}/resumen`,
  infraestructuraDesgloseUpp: `${infraestructuraPath}/desglose-upp`,
  infraestructuraNecesidad: `${infraestructuraPath}/necesidad`,
  infraestructuraCercado: `${infraestructuraPath}/cercado`,
  infraestructuraCercadoUpp: `${infraestructuraPath}/cercado/upp`,
  infraestructuraCatalogos: `${infraestructuraPath}/catalogos`,
  infraestructuraExport: `${infraestructuraPath}/export`,
  infraestructuraCacheFlush: `${infraestructuraPath}/cache/flush`,
  ranchoSuperficie: `${ranchoPath}/superficie`,
  ranchoTamanoProductor: `${ranchoPath}/tamano-productor`,
  ranchoApoyos: `${ranchoPath}/apoyos`,
  ranchoTipoProduccion: `${ranchoPath}/tipo-produccion`,
  ranchoCargaAnimal: `${ranchoPath}/carga-animal`,
  ranchoRegistroPropiedad: `${ranchoPath}/registro-propiedad`,
  ranchoCatalogos: `${ranchoPath}/catalogos`,
  ranchoExport: `${ranchoPath}/export`,
  ranchoCacheFlush: `${ranchoPath}/cache/flush`,
  usoSueloCobertura: `${usoSueloPath}/cobertura`,
  usoSueloCoberturaEvolucion: `${usoSueloPath}/cobertura/evolucion`,
  usoSueloClima: `${usoSueloPath}/clima`,
  usoSueloAgua: `${usoSueloPath}/agua`,
  usoSueloPastoreo: `${usoSueloPath}/pastoreo`,
  usoSueloCatalogos: `${usoSueloPath}/catalogos`,
  usoSueloExport: `${usoSueloPath}/export`,
  usoSueloClimaSincronizar: `${usoSueloPath}/clima/sincronizar`,
  usoSueloCacheFlush: `${usoSueloPath}/cache/flush`,
  sanidadResumen: `${sanidadPath}/resumen`,
  sanidadCartillaVacunacion: `${sanidadPath}/cartilla-vacunacion`,
  sanidadUppCertificadas: `${sanidadPath}/upp-certificadas`,
  sanidadEnfermedades: `${sanidadPath}/enfermedades`,
  sanidadProtocolos: `${sanidadPath}/protocolos`,
  sanidadCoberturaEnfermedades: `${sanidadPath}/cobertura-enfermedades`,
  sanidadRecomendaciones: `${sanidadPath}/recomendaciones`,
  sanidadCatalogos: `${sanidadPath}/catalogos`,
  sanidadExport: `${sanidadPath}/export`,
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
  analysisTable: `${path}/dashboard/cost/analysis-table`,
  // BioParcela
  deactivateOtp: `${path}/user/deactivate/request-otp`,
  deactivateConfirm: `${path}/user/deactivate/confirm`
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
