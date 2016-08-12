/*global define*/
define(['underscore'],function(_) {
	
    'use strict';

 	var codes = CodesMap(),
 		defaultCodes = 'gaul';

	function Codes2Codes(code) {
		this.code = (''+code).toUpperCase();
		this.in = defaultCodes;
	}

	Codes2Codes.prototype.from = function(codein) {
		this.in = ''+codein.toLowerCase();
		return this;
	};

	Codes2Codes.prototype.to = function(codeout) {
		//TODO caching
		var p = {};
		
		p[ ''+this.in ] = this.code;

		var res = _.findWhere(codes, p);

		return res ? res[codeout.toLowerCase()] : null;
	};

	return function(args) {
		return new Codes2Codes(args);
	};

function CodesMap() {
return [
{
"gaul": "1",
"iso2": "AF",
"iso3": "AFG"
},
{
"gaul": "10",
"iso2": "AQ",
"iso3": "ATA"
},
{
"gaul": "100",
"iso2": "GP",
"iso3": "GLP"
},
{
"gaul": "101",
"iso2": "GU",
"iso3": "GUM"
},
{
"gaul": "103",
"iso2": "GT",
"iso3": "GTM"
},
{
"gaul": "104",
"iso2": "GG",
"iso3": "GGY"
},
{
"gaul": "105",
"iso2": "GW",
"iso3": "GNB"
},
{
"gaul": "106",
"iso2": "GN",
"iso3": "GIN"
},
{
"gaul": "107",
"iso2": "GY",
"iso3": "GUY"
},
{
"gaul": "108",
"iso2": "HT",
"iso3": "HTI"
},
{
"gaul": "109",
"iso2": "HM",
"iso3": "HMD"
},
{
"gaul": "11",
"iso2": "AG",
"iso3": "ATG"
},
{
"gaul": "110",
"iso2": "VA",
"iso3": "VAT"
},
{
"gaul": "111",
"iso2": "HN",
"iso3": "HND"
},
{
"gaul": "112",
"iso2": "",
"iso3": ""
},
{
"gaul": "113",
"iso2": "HU",
"iso3": "HUN"
},
{
"gaul": "114",
"iso2": "IS",
"iso3": "ISL"
},
{
"gaul": "115",
"iso2": "IN",
"iso3": "IND"
},
{
"gaul": "116",
"iso2": "ID",
"iso3": "IDN"
},
{
"gaul": "117",
"iso2": "IR",
"iso3": "IRN"
},
{
"gaul": "118",
"iso2": "IQ",
"iso3": "IRQ"
},
{
"gaul": "119",
"iso2": "IE",
"iso3": "IRL"
},
{
"gaul": "12",
"iso2": "AR",
"iso3": "ARG"
},
{
"gaul": "120",
"iso2": "IM",
"iso3": "IMN"
},
{
"gaul": "121",
"iso2": "IL",
"iso3": "ISR"
},
{
"gaul": "122",
"iso2": "IT",
"iso3": "ITA"
},
{
"gaul": "123",
"iso2": "JM",
"iso3": "JAM"
},
{
"gaul": "126",
"iso2": "JP",
"iso3": "JPN"
},
{
"gaul": "127",
"iso2": "",
"iso3": ""
},
{
"gaul": "128",
"iso2": "JE",
"iso3": "JEY"
},
{
"gaul": "129",
"iso2": "",
"iso3": "JTN"
},
{
"gaul": "13",
"iso2": "AM",
"iso3": "ARM"
},
{
"gaul": "130",
"iso2": "JO",
"iso3": "JOR"
},
{
"gaul": "131",
"iso2": "",
"iso3": ""
},
{
"gaul": "132",
"iso2": "KZ",
"iso3": "KAZ"
},
{
"gaul": "133",
"iso2": "KE",
"iso3": "KEN"
},
{
"gaul": "134",
"iso2": "",
"iso3": ""
},
{
"gaul": "135",
"iso2": "KI",
"iso3": "KIR"
},
{
"gaul": "136",
"iso2": "KW",
"iso3": ""
},
{
"gaul": "137",
"iso2": "KG",
"iso3": "KWT"
},
{
"gaul": "138",
"iso2": "",
"iso3": "KGZ"
},
{
"gaul": "139",
"iso2": "LA",
"iso3": "LAO"
},
{
"gaul": "14",
"iso2": "AW",
"iso3": "ABW"
},
{
"gaul": "140",
"iso2": "LV",
"iso3": "LVA"
},
{
"gaul": "141",
"iso2": "LB",
"iso3": "LBN"
},
{
"gaul": "142",
"iso2": "LS",
"iso3": "LSO"
},
{
"gaul": "143",
"iso2": "",
"iso3": ""
},
{
"gaul": "144",
"iso2": "LR",
"iso3": "LBR"
},
{
"gaul": "145",
"iso2": "LY",
"iso3": "LBY"
},
{
"gaul": "146",
"iso2": "LI",
"iso3": "LIE"
},
{
"gaul": "147",
"iso2": "LT",
"iso3": "LTU"
},
{
"gaul": "147295+147296",
"iso2": "CN",
"iso3": "CHN"
},
{
"gaul": "148",
"iso2": "LU",
"iso3": "LUX"
},
{
"gaul": "149",
"iso2": "MO",
"iso3": "MAC"
},
{
"gaul": "15",
"iso2": "",
"iso3": ""
},
{
"gaul": "150",
"iso2": "MG",
"iso3": "MDG"
},
{
"gaul": "151",
"iso2": "",
"iso3": ""
},
{
"gaul": "152",
"iso2": "MW",
"iso3": "MWI"
},
{
"gaul": "153",
"iso2": "MY",
"iso3": "MYS"
},
{
"gaul": "154",
"iso2": "MV",
"iso3": "MDV"
},
{
"gaul": "155",
"iso2": "ML",
"iso3": "MLI"
},
{
"gaul": "156",
"iso2": "MT",
"iso3": "MLT"
},
{
"gaul": "157",
"iso2": "MH",
"iso3": "MHL"
},
{
"gaul": "158",
"iso2": "MQ",
"iso3": "MTQ"
},
{
"gaul": "159",
"iso2": "MR",
"iso3": "MRT"
},
{
"gaul": "16",
"iso2": "",
"iso3": ""
},
{
"gaul": "160",
"iso2": "MU",
"iso3": "MUS"
},
{
"gaul": "161",
"iso2": "YT",
"iso3": "MYT"
},
{
"gaul": "162",
"iso2": "MX",
"iso3": "MEX"
},
{
"gaul": "163",
"iso2": "FM",
"iso3": "FSM"
},
{
"gaul": "164",
"iso2": "",
"iso3": "MID"
},
{
"gaul": "165",
"iso2": "MD",
"iso3": "MDA"
},
{
"gaul": "166",
"iso2": "MC",
"iso3": "MCO"
},
{
"gaul": "167",
"iso2": "MN",
"iso3": "MNG"
},
{
"gaul": "168",
"iso2": "MS",
"iso3": "MSR"
},
{
"gaul": "169",
"iso2": "MA",
"iso3": "MAR"
},
{
"gaul": "17",
"iso2": "AU",
"iso3": "AUS"
},
{
"gaul": "170",
"iso2": "MZ",
"iso3": "MOZ"
},
{
"gaul": "171",
"iso2": "MM",
"iso3": "MMR"
},
{
"gaul": "172",
"iso2": "NA",
"iso3": "NAM"
},
{
"gaul": "173",
"iso2": "NR",
"iso3": "NRU"
},
{
"gaul": "174",
"iso2": "",
"iso3": "XXX"
},
{
"gaul": "175",
"iso2": "NP",
"iso3": "NPL"
},
{
"gaul": "176",
"iso2": "AN",
"iso3": "ANT"
},
{
"gaul": "177",
"iso2": "NL",
"iso3": "NLD"
},
{
"gaul": "178",
"iso2": "NC",
"iso3": "NCL"
},
{
"gaul": "179",
"iso2": "NZ",
"iso3": "NZL"
},
{
"gaul": "18",
"iso2": "AT",
"iso3": "AUT"
},
{
"gaul": "180",
"iso2": "NI",
"iso3": "NIC"
},
{
"gaul": "181",
"iso2": "NE",
"iso3": "NER"
},
{
"gaul": "182",
"iso2": "NG",
"iso3": "NGA"
},
{
"gaul": "183",
"iso2": "NU",
"iso3": "NIU"
},
{
"gaul": "184",
"iso2": "NF",
"iso3": "NFK"
},
{
"gaul": "185",
"iso2": "MP",
"iso3": "MNP"
},
{
"gaul": "186",
"iso2": "NO",
"iso3": "NOR"
},
{
"gaul": "187",
"iso2": "OM",
"iso3": "OMN"
},
{
"gaul": "188",
"iso2": "PK",
"iso3": "PAK"
},
{
"gaul": "189",
"iso2": "PW",
"iso3": "PLW"
},
{
"gaul": "19",
"iso2": "AZ",
"iso3": "AZE"
},
{
"gaul": "190",
"iso2": "",
"iso3": "XXX"
},
{
"gaul": "191",
"iso2": "PA",
"iso3": "PAN"
},
{
"gaul": "192",
"iso2": "PG",
"iso3": "PNG"
},
{
"gaul": "193",
"iso2": "",
"iso3": ""
},
{
"gaul": "194",
"iso2": "PY",
"iso3": "PRY"
},
{
"gaul": "195",
"iso2": "PE",
"iso3": "PER"
},
{
"gaul": "196",
"iso2": "PH",
"iso3": "PHL"
},
{
"gaul": "197",
"iso2": "PN",
"iso3": "PCN"
},
{
"gaul": "198",
"iso2": "PL",
"iso3": "POL"
},
{
"gaul": "199",
"iso2": "PT",
"iso3": "PRT"
},
{
"gaul": "2",
"iso2": "",
"iso3": ""
},
{
"gaul": "20",
"iso2": "BS",
"iso3": "BHS"
},
{
"gaul": "200",
"iso2": "PR",
"iso3": "PRI"
},
{
"gaul": "201",
"iso2": "QA",
"iso3": "QAT"
},
{
"gaul": "202",
"iso2": "KR",
"iso3": "KOR"
},
{
"gaul": "203",
"iso2": "RO",
"iso3": "ROU"
},
{
"gaul": "204",
"iso2": "RU",
"iso3": "RUS"
},
{
"gaul": "205",
"iso2": "RW",
"iso3": "RWA"
},
{
"gaul": "206",
"iso2": "RE",
"iso3": "REU"
},
{
"gaul": "207",
"iso2": "SH",
"iso3": "SHN"
},
{
"gaul": "208",
"iso2": "KN",
"iso3": "KNA"
},
{
"gaul": "209",
"iso2": "LC",
"iso3": "LCA"
},
{
"gaul": "21",
"iso2": "BH",
"iso3": "BHR"
},
{
"gaul": "210",
"iso2": "PM",
"iso3": "SPM"
},
{
"gaul": "211",
"iso2": "VC",
"iso3": "VCT"
},
{
"gaul": "212",
"iso2": "WS",
"iso3": "WSM"
},
{
"gaul": "213",
"iso2": "SM",
"iso3": "SMR"
},
{
"gaul": "214",
"iso2": "ST",
"iso3": "STP"
},
{
"gaul": "215",
"iso2": "SA",
"iso3": "SAU"
},
{
"gaul": "216",
"iso2": "",
"iso3": ""
},
{
"gaul": "217",
"iso2": "SN",
"iso3": "SEN"
},
{
"gaul": "218",
"iso2": "",
"iso3": ""
},
{
"gaul": "22",
"iso2": "",
"iso3": "UMI"
},
{
"gaul": "220",
"iso2": "SC",
"iso3": "SYC"
},
{
"gaul": "221",
"iso2": "SL",
"iso3": "SLE"
},
{
"gaul": "222",
"iso2": "SG",
"iso3": "SGP"
},
{
"gaul": "223",
"iso2": "SK",
"iso3": "SVK"
},
{
"gaul": "224",
"iso2": "SI",
"iso3": "SVN"
},
{
"gaul": "225",
"iso2": "SB",
"iso3": "SLB"
},
{
"gaul": "226",
"iso2": "SO",
"iso3": "SOM"
},
{
"gaul": "227",
"iso2": "ZA",
"iso3": "ZAF"
},
{
"gaul": "228",
"iso2": "GS",
"iso3": "SGS"
},
{
"gaul": "229",
"iso2": "ES",
"iso3": "ESP"
},
{
"gaul": "23",
"iso2": "BD",
"iso3": "BGD"
},
{
"gaul": "230",
"iso2": "",
"iso3": ""
},
{
"gaul": "231",
"iso2": "LK",
"iso3": "LKA"
},
{
"gaul": "233",
"iso2": "SR",
"iso3": "SUR"
},
{
"gaul": "234",
"iso2": "SJ",
"iso3": "SJM"
},
{
"gaul": "235",
"iso2": "SZ",
"iso3": "SWZ"
},
{
"gaul": "236",
"iso2": "SE",
"iso3": "SWE"
},
{
"gaul": "237",
"iso2": "CH",
"iso3": "CHE"
},
{
"gaul": "238",
"iso2": "SY",
"iso3": "SYR"
},
{
"gaul": "239",
"iso2": "TJ",
"iso3": "TJK"
},
{
"gaul": "24",
"iso2": "BB",
"iso3": "BRB"
},
{
"gaul": "240",
"iso2": "TH",
"iso3": "THA"
},
{
"gaul": "241",
"iso2": "MK",
"iso3": "MKD"
},
{
"gaul": "242",
"iso2": "TL",
"iso3": "TLS"
},
{
"gaul": "243",
"iso2": "TG",
"iso3": "TGO"
},
{
"gaul": "244",
"iso2": "TK",
"iso3": "TKL"
},
{
"gaul": "245",
"iso2": "TO",
"iso3": "TON"
},
{
"gaul": "246",
"iso2": "TT",
"iso3": "TTO"
},
{
"gaul": "247",
"iso2": "",
"iso3": ""
},
{
"gaul": "248",
"iso2": "TN",
"iso3": "TUN"
},
{
"gaul": "249",
"iso2": "TR",
"iso3": "TUR"
},
{
"gaul": "25",
"iso2": "",
"iso3": ""
},
{
"gaul": "250",
"iso2": "TM",
"iso3": "TKM"
},
{
"gaul": "251",
"iso2": "TC",
"iso3": "TCA"
},
{
"gaul": "252",
"iso2": "TV",
"iso3": "TUV"
},
{
"gaul": "253",
"iso2": "UG",
"iso3": "UGA"
},
{
"gaul": "254",
"iso2": "UA",
"iso3": "UKR"
},
{
"gaul": "255",
"iso2": "AE",
"iso3": "ARE"
},
{
"gaul": "256",
"iso2": "GB",
"iso3": "GBR"
},
{
"gaul": "257",
"iso2": "TZ",
"iso3": "TZA"
},
{
"gaul": "258",
"iso2": "VI",
"iso3": "VIR"
},
{
"gaul": "259",
"iso2": "US",
"iso3": "USA"
},
{
"gaul": "26",
"iso2": "BY",
"iso3": "BLR"
},
{
"gaul": "260",
"iso2": "UY",
"iso3": "URY"
},
{
"gaul": "261",
"iso2": "UZ",
"iso3": "UZB"
},
{
"gaul": "262",
"iso2": "VU",
"iso3": "VUT"
},
{
"gaul": "263",
"iso2": "VE",
"iso3": "VEN"
},
{
"gaul": "264",
"iso2": "VN",
"iso3": "VNM"
},
{
"gaul": "2647",
"iso2": "ME",
"iso3": "MNE"
},
{
"gaul": "2648",
"iso2": "RS",
"iso3": "SRB"
},
{
"gaul": "265",
"iso2": "WK",
"iso3": "WAK"
},
{
"gaul": "266",
"iso2": "WF",
"iso3": "WLF"
},
{
"gaul": "267",
"iso2": " ",
"iso3": ""
},
{
"gaul": "268",
"iso2": "EH",
"iso3": "ESH"
},
{
"gaul": "269",
"iso2": "YE",
"iso3": "YEM"
},
{
"gaul": "27",
"iso2": "BE",
"iso3": "BEL"
},
{
"gaul": "270",
"iso2": "ZM",
"iso3": "ZMB"
},
{
"gaul": "271",
"iso2": "ZW",
"iso3": "ZWE"
},
{
"gaul": "28",
"iso2": "BZ",
"iso3": "BLZ"
},
{
"gaul": "29",
"iso2": "BJ",
"iso3": "BEN"
},
{
"gaul": "3",
"iso2": "AL",
"iso3": "ALB"
},
{
"gaul": "30",
"iso2": "BM",
"iso3": "BMU"
},
{
"gaul": "31",
"iso2": "BT",
"iso3": "BTN"
},
{
"gaul": "32",
"iso2": "",
"iso3": ""
},
{
"gaul": "33",
"iso2": "BO",
"iso3": "BOL"
},
{
"gaul": "33364",
"iso2": "HK",
"iso3": "HKG"
},
{
"gaul": "34",
"iso2": "BA",
"iso3": "BIH"
},
{
"gaul": "35",
"iso2": "BW",
"iso3": "BWA"
},
{
"gaul": "36",
"iso2": "BV",
"iso3": "BVT"
},
{
"gaul": "37",
"iso2": "BR",
"iso3": "BRA"
},
{
"gaul": "38",
"iso2": "IO",
"iso3": "IOT"
},
{
"gaul": "39",
"iso2": "VG",
"iso3": "VGB"
},
{
"gaul": "4",
"iso2": "DZ",
"iso3": "DZA"
},
{
"gaul": "40",
"iso2": "BN",
"iso3": "BRN"
},
{
"gaul": "40760",
"iso2": "",
"iso3": "XXX"
},
{
"gaul": "40762",
"iso2": "",
"iso3": "XXX"
},
{
"gaul": "40763",
"iso2": "",
"iso3": ""
},
{
"gaul": "40764",
"iso2": "SD",
"iso3": "SDN"
},
{
"gaul": "40765",
"iso2": "EG",
"iso3": "EGY"
},
{
"gaul": "40781",
"iso2": "",
"iso3": ""
},
{
"gaul": "41",
"iso2": "BG",
"iso3": "BGR"
},
{
"gaul": "42",
"iso2": "BF",
"iso3": "BFA"
},
{
"gaul": "43",
"iso2": "BI",
"iso3": "BDI"
},
{
"gaul": "44",
"iso2": "KH",
"iso3": "KHM"
},
{
"gaul": "45",
"iso2": "CM",
"iso3": "CMR"
},
{
"gaul": "46",
"iso2": "CA",
"iso3": "CAN"
},
{
"gaul": "47",
"iso2": "CV",
"iso3": "CPV"
},
{
"gaul": "48",
"iso2": "KY",
"iso3": "CYM"
},
{
"gaul": "49",
"iso2": "CF",
"iso3": "CAF"
},
{
"gaul": "5",
"iso2": "AS",
"iso3": "ASM"
},
{
"gaul": "50",
"iso2": "TD",
"iso3": "TCD"
},
{
"gaul": "51",
"iso2": "CL",
"iso3": "CHL"
},
{
"gaul": "52",
"iso2": "",
"iso3": ""
},
{
"gaul": "54",
"iso2": "CX",
"iso3": "CXR"
},
{
"gaul": "55",
"iso2": "",
"iso3": ""
},
{
"gaul": "56",
"iso2": "CC",
"iso3": "CCK"
},
{
"gaul": "57",
"iso2": "CO",
"iso3": "COL"
},
{
"gaul": "58",
"iso2": "KM",
"iso3": "COM"
},
{
"gaul": "59",
"iso2": "CG",
"iso3": "COG"
},
{
"gaul": "6",
"iso2": "",
"iso3": "SDN"
},
{
"gaul": "60",
"iso2": "CK",
"iso3": "COK"
},
{
"gaul": "61",
"iso2": "CR",
"iso3": "CRI"
},
{
"gaul": "61013",
"iso2": "",
"iso3": ""
},
{
"gaul": "62",
"iso2": "HR",
"iso3": "HRV"
},
{
"gaul": "63",
"iso2": "CU",
"iso3": "CUB"
},
{
"gaul": "64",
"iso2": "CY",
"iso3": "CYP"
},
{
"gaul": "65",
"iso2": "CZ",
"iso3": "CZE"
},
{
"gaul": "66",
"iso2": "CI",
"iso3": "CIV"
},
{
"gaul": "67",
"iso2": "KP",
"iso3": "PRK"
},
{
"gaul": "68",
"iso2": "CD",
"iso3": "COD"
},
{
"gaul": "69",
"iso2": "DK",
"iso3": "DNK"
},
{
"gaul": "7",
"iso2": "AD",
"iso3": "AND"
},
{
"gaul": "70",
"iso2": "DJ",
"iso3": "DJI"
},
{
"gaul": "71",
"iso2": "DM",
"iso3": "DMA"
},
{
"gaul": "72",
"iso2": "DO",
"iso3": "DOM"
},
{
"gaul": "73",
"iso2": "EC",
"iso3": "ECU"
},
{
"gaul": "74",
"iso2": "",
"iso3": "SSD"
},
{
"gaul": "74578",
"iso2": "",
"iso3": "PRT"
},
{
"gaul": "75",
"iso2": "SV",
"iso3": "SLV"
},
{
"gaul": "76",
"iso2": "GQ",
"iso3": "GNQ"
},
{
"gaul": "77",
"iso2": "ER",
"iso3": "ERI"
},
{
"gaul": "78",
"iso2": "EE",
"iso3": "EST"
},
{
"gaul": "79",
"iso2": "ET",
"iso3": "ETH"
},
{
"gaul": "8",
"iso2": "AO",
"iso3": "AGO"
},
{
"gaul": "80",
"iso2": "",
"iso3": ""
},
{
"gaul": "81",
"iso2": "FK",
"iso3": "FLK"
},
{
"gaul": "82",
"iso2": "FO",
"iso3": "FRO"
},
{
"gaul": "83",
"iso2": "FJ",
"iso3": "FJI"
},
{
"gaul": "84",
"iso2": "FI",
"iso3": "FIN"
},
{
"gaul": "85",
"iso2": "FR",
"iso3": "FRA"
},
{
"gaul": "86",
"iso2": "GF",
"iso3": "GUF"
},
{
"gaul": "87",
"iso2": "PF",
"iso3": "PYF"
},
{
"gaul": "88",
"iso2": "TF",
"iso3": "ATF"
},
{
"gaul": "89",
"iso2": "GA",
"iso3": "GAB"
},
{
"gaul": "9",
"iso2": "AI",
"iso3": "AIA"
},
{
"gaul": "90",
"iso2": "GM",
"iso3": "GMB"
},
{
"gaul": "91",
"iso2": " ",
"iso3": ""
},
{
"gaul": "92",
"iso2": "GE",
"iso3": "GEO"
},
{
"gaul": "93",
"iso2": "DE",
"iso3": "DEU"
},
{
"gaul": "94",
"iso2": "GH",
"iso3": "GHA"
},
{
"gaul": "95",
"iso2": "GI",
"iso3": "GIB"
},
{
"gaul": "96",
"iso2": "",
"iso3": ""
},
{
"gaul": "97",
"iso2": "GR",
"iso3": "GRC"
},
{
"gaul": "98",
"iso2": "GL",
"iso3": "GRL"
},
{
"gaul": "99",
"iso2": "GD",
"iso3": "GRD"
}];
}

});
