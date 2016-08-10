/*global define*/
define({

    // Btn and search
    "btn_go": "View Data",
    "btn_reset": "Reset",
    "courtesy_message" : "No results",
    "no_results" : "No Results",
    "selector_select_all" : "Select All",
    "selector_select_none" : "Select None",
    
    "browse_title": "Browse by domain",

    //Dashboard filter's selector titles
    "filter_IndicatorCode" : "Indicator",

    "empty_commodities": "No commodity prices available at the moment",
    
    //Lateral menu labels
    "menu_demographic" : "Demographic and social statistics",
    "menu_population" : "Population",
    "menu_education" : "Education",
    "menu_health" : "Health",
    "menu_labour" : "Labour",
    "menu_economics" : "Economic statistics",
    "menu_balance_of_payments" : "Balance of Payments",
    "menu_gdp" : "GDP",
    "menu_monetary_statistics" : "Monetary Statistics",
    "menu_financial_flows" : "Financial Flows",
    "menu_public_finance" : "Public Finance",
    "menu_debt" : "Debt",
    "menu_inflation" : "Inflation",
    "menu_energy" : "Energy",
    "menu_tourism" : "Tourism",
    "menu_infrastructure" : "Infrastructure",
    "menu_production" : "Production",
    "menu_agriculture_production" : "Agriculture production",
    "menu_mining_production" : "Mining production",
    "menu_expenditure_gdp" : "Expenditure on GDP",
    "menu_poverty" : "Poverty",

    //Country names
    "DZA": "Algeria",
    "AGO": "Angola",
    "BEN": "Benin",
    "BWA": "Botswana",
    "BFA": "Burkina Faso",
    "COD": "Congo, Dem. Republic",
    "EGY": "Egypt",
    "KEN": "Kenya",
    "SEN": "Senegal",
    "ETH": "Ethiopia",
    "TZA": "Tanzania",
    "UGA": "Uganda",
    "NGA": "Nigeria",
    "COG": "Congo",
    "BDI": "Burundi",
    "CMR": "Cameroon",
    "CPV": "Cabo Verde",
    "CAF": "Central African Republic",
    
    //analysis
    "analysis_title": "Analysis",
    catalog_button : "OPEN CATALOG",
    
    //errors
    "select_at_least_one_variable": "Please select at lease one variable",
    "select_at_least_one_geo" : "Please select at lease one country or region",
    "fill_all_fields": "Please fill all the required fields.",
    "request_error" : "Internet Request error. Please try again.",
    "preload_resources_error" : "Impossible to load page resources.",

    "no_input" : "Internal error: Invalid input format.",
    "country_empty" : "Country can not be empty.",
    "indicator_empty" : "Indicator can not be empty.",
    "qualifier_empty" : "Qualifier can not be empty.",
    "year_empty" : "Year can not be empty.",
    
    //home

    "text" : "Change me in i18n/root/home.js",
    "authentication_credentials" : "login username/password: guest@fenix/guest",
    home_partner_fra: " The FAO Global Forest Resources Assessment organizes, collects, analyzes and distributes a broad range of forest resource data in close collaboration with a network of National Correspondents who prepare reports based on a standard online questionnaire.  The first assessment was published in 1948 and is now conducted every five years.",
    home_partner_fe: "FOREST EUROPE (The Ministerial Conference on the Protection of Forests in Europe) is the pan-European political process for the sustainable management of the continent’s forests. ",
    home_partner_unece: "UN Economic Commission for Europe: We monitor the state of forests in the region, help in developing evidence-based policies for sustainable forest management, communicate about the many products and ecosystem services provided to society and assist countries to monitor and manage forests",
    home_partner_mp: "The Montreal Process: The Montreal Process, through its Criteria and Indicators of Sustainable Forest Management provides its member countries with an internationally agreed, locally supported tool to integrate issues as they apply to forests.",
    home_partner_ofac: "Observatoire des Forets dÁfrique Centrale (OFAC). The overall objective of OFAC is to support the Central African Forest Commission to manage the forests of Central Africa in a sustainable manner.",
    home_partner_itto: "ITTO: The International Tropical Timber Organization (ITTO) collects, analyzes and disseminates data on the production and trade of tropical timber and funds projects and other actions aimed at developing industries at both the community and industrial scales.",

    //site
    FAO_HEADER_ABOUT : 'About FAO',
    FAO_HEADER_ABOUT_LINK : '',
    FAO_HEADER_ACTION : 'In Action',
    FAO_HEADER_ACTION_LINK : '',
    FAO_HEADER_COUNTRIES : 'Countries',
    FAO_HEADER_COUNTRIES_LINK : '',
    FAO_HEADER_THEMES : 'Themes',
    FAO_HEADER_THEMES_LINK : '',
    FAO_HEADER_MEDIA : 'Media',
    FAO_HEADER_MEDIA_LINK : '',
    FAO_HEADER_PUBLICATIONS : 'Publications',
    FAO_HEADER_PUBLICATIONS_LINK : '',
    FAO_HEADER_STATISTICS : 'Statistics',
    FAO_HEADER_STATISTICS_LINK : '',
    FAO_HEADER_PARTNERSHIPS : 'Partnerships',
    FAO_HEADER_PARTNERSHIPS_LINK : '',

    //Dashboard profile
    summary_geo_info : "Geographical position",
    summary_info : "Main information",
    capital_city_header : "Capital city",
    GAUL_code_text:"Country code (GAUL)",
    area_sq: "Area in sq. km",
    currency_label: "Currency",

    //population

    population1_title: "Mid-year population",
    population2_title:"Average growth rate",
    population3_title:"Mid-year population by age group",
    population4_title: "Life expectancy",
    population5_title: "Population pyramid",
    population6_title:"Urbanization rate",

    //education

    edu1_title :"Enrolment primary school",
    edu2_title :"Enrolment primary, secondary, tertiary school",
    edu3_title :"Literacy rate by gender",

    // health

    health1_title:"Percentage of children provided the vaccines",
    health2_title:"Percentage of underweight children (under-five)",
    health3_title:"Prevalence of undernourishment",
    health4_title: "Infant mortality rate",
    health5_title:  "Medical staff and infrastructure",

    //Labour
    labour1_title: "Economically active population",
    labour2_title:"Economically active population by sector",
    labour3_title:"Economically active population by gender",
    labour4_title:"Economically active population",
    labour5_title:"Unemployment rate",
    labour6_title: "Unemployment rate by gender",


    //monetary statistics
    monetary1_title: "Domestic credit",
    monetary2_title: "Net foreign assets",
    monetary3_title:"International reserves",
    monetary4_title:"Money supply (M1)",
    monetary5_title: "Quasi-money",


    //public_finance


    finance1_title:"Components of total revenues and grants",
    finance2_title:"Total expenditures and net lending",
    finance3_title: "Total expenditures and net lending",
    finance4_title:"Current expenditure",
    finance5_title:"Fiscal balance",

    //balance_of_payments

    BOP1_title: "Current account balance",
    BOP2_title: "Capital and financial account",
    BOP3_title:  "Trade balance",

    //energy
    energy1_title: "Production of electricity, total",
    energy2_title:"Production of electricity, public",
    energy3_title:"Electricity gross production, public and self-produced",

    //poverty
    poverty1_title: "Share of income Held by Poorest 10 %",
    poverty2_title:  "Share of income Held by Poorest 10 %",
    poverty3_title: "Population below 2$ (PPP) per day",
    poverty4_title: "Human poverty index",

    //gdp
    gdp1_title:"GDP (Current prices)",
    gdp2_title:"GDP growth (annual %)",
    gdp3_title:"GDP per capita",


    //expenditure_gdp

    expenditure1_title: "General government final consumption expenditure",
    expenditure2_title:        "Individual consumption expenditure",
    expenditure3_title:     "Gross fixed capital formation",
    expenditure4_title:     "Changes in inventories",
    current_title : "Current prices",
    constant_title : "Constant prices",


    //financial_flows

    financial_flows1_title: "Net total official development assistance",
    financial_flows2_title: "Net foreign direct investment inflows",
    financial_flows3_title:"Distribution of net foreign direct investment inflows by country",
    financial_flows_note1: "Note: Last year available (2012)",
    financial_flows4_title:"Net foreign direct investment inflows by year",
    financial_flows5_title: "Distribution of origin of FDI Inflows by country",
    financial_flows_note2: "Note: Last year available (2012)",
    financial_flows6_title: "Origin of FDI Inflows by year",

    // debt

    debt1_title: "Total government domestic debt",
    debt2_title:"Total external debt",
    debt3_title:"Total external debt - Public/Private",

    //inflation

    inflation1_title: "Inflation by kind of commodity",
    inflation2_title:  "Inflation, consumer prices",
    inflation3_title: "Inflation, GDP deflator (annual%)",




   //tourism
    tourism1_title:  "Total contribution to GDP and employment",
    tourism2_title: "International tourism, number of arrivals",
    tourism3_title: "International tourism, receipts",
    tourism4_title: "Rooms in hotel and similar establishments",





    //Browse by domain

    //Population
    //  population1_title: "Mid-year population",
    //  population2_title:"Average growth rate",
    //  population4_title: "Life expectancy",

    //  population6_title:"Urbanization rate",

    //education

    edu1_title_domain :"Gross enrolment rate",
    //edu3_title :"Literacy rate by gender",
    edu3_title_domain: "Overall literacy rate",
    //edu2_title :"Enrolment primary, secondary, tertiary school",

    // health

    //health1_title:"Percentage of children provided the vaccines",
    //health2_title:"Percentage of underweight children (under-five)",
    //health3_title:"Prevalence of undernourishment",


    //Labour

    // labour2_title:"Economically active population by sector",
    // labour3_title:"Economically active population by gender",
    labour4_title_domain:"Percentage of female active population",
    // labour5_title:"Unemployment rate",
    // labour6_title: "Unemployment rate by gender",


    //Balance of payment
    BOP1_title_Domain: "Overall balance of payments of African countries (% GDP)",
    BOP2_title_Domain: "Overall balance of payments over time (% GDP)",
    BOP3_title_Domain: "Current account balance"
    //gdp

    //gdp2_title:"GDP growth (annual %)",
    //gdp3_title:"GDP per capita",


});