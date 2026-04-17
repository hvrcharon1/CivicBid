import 'package:http/http.dart' as http;
import 'dart:convert';

/// Portal model representing a government auction source
class Portal {
  final String id;
  final String name;
  final String url;
  final String category; // 'federal' or 'state'
  final String apiUrl;
  final String? state; // For state portals

  Portal({
    required this.id,
    required this.name,
    required this.url,
    required this.category,
    required this.apiUrl,
    this.state,
  });

  factory Portal.fromJson(Map<String, dynamic> json) {
    return Portal(
      id: json['id'] as String,
      name: json['name'] as String,
      url: json['url'] as String,
      category: json['category'] as String,
      apiUrl: json['apiUrl'] as String,
      state: json['state'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'url': url,
      'category': category,
      'apiUrl': apiUrl,
      'state': state,
    };
  }
}

/// Service for managing government auction portals
class PortalService {
  static const String _baseUrl = 'https://api.civicbid.com';
  
  /// Federal portals (10 sources)
  static const List<String> federalPortalIds = [
    'GSA_AUCTIONS',
    'REAL_ESTATE_SALES',
    'USA_AUCTIONS',
    'USA_CAR_AUCTIONS',
    'TREASURY_AUCTIONS',
    'TREASURY_REPO',
    'US_MARSHALS',
    'HUD_HOMES',
    'FDIC_REAL_ESTATE',
    'BLM_LAND_SALES',
  ];

  /// State portals (17 sources)
  static const List<String> statePortalIds = [
    'CA_SURPLUS',
    'CT_SURPLUS',
    'DE_SURPLUS',
    'IL_SURPLUS',
    'MA_SURPLUS',
    'MN_SURPLUS',
    'NC_SURPLUS',
    'OR_SURPLUS',
    'TX_SURPLUS',
    'NY_SURPLUS',
    'FL_SURPLUS',
    'GA_SURPLUS',
    'PA_SURPLUS',
    'VA_SURPLUS',
    'WA_SURPLUS',
    'CO_SURPLUS',
    'OH_SURPLUS',
  ];

  /// Federal portal details
  static const Map<String, Map<String, String>> federalPortals = {
    'GSA_AUCTIONS': {
      'name': 'GSA Auctions',
      'url': 'https://www.gsaauctions.gov/auctions/home',
    },
    'REAL_ESTATE_SALES': {
      'name': 'Real Estate Sales',
      'url': 'https://www.realestatesales.gov/',
    },
    'USA_AUCTIONS': {
      'name': 'USA.gov Auctions',
      'url': 'https://www.usa.gov/auctions-and-sales',
    },
    'USA_CAR_AUCTIONS': {
      'name': 'USA Car Auctions',
      'url': 'https://www.usa.gov/car-auctions',
    },
    'TREASURY_AUCTIONS': {
      'name': 'Treasury Auctions',
      'url': 'https://home.treasury.gov/services/treasury-auctions',
    },
    'TREASURY_REPO': {
      'name': 'Treasury Repurchase',
      'url': 'https://www.treasury.gov/auctions/treasury/rp/',
    },
    'US_MARSHALS': {
      'name': 'US Marshals Asset Forfeiture',
      'url': 'https://www.usmarshals.gov/what-we-do/asset-forfeiture',
    },
    'HUD_HOMES': {
      'name': 'HUD Home Store',
      'url': 'https://www.hudhomestore.gov/',
    },
    'FDIC_REAL_ESTATE': {
      'name': 'FDIC Real Estate Sales',
      'url': 'https://www.fdic.gov/resources/resolutions/real-estate-sales/',
    },
    'BLM_LAND_SALES': {
      'name': 'BLM Land Sales',
      'url': 'https://www.blm.gov/programs/lands-and-realty/land-sales',
    },
  };

  /// State portal details
  static const Map<String, Map<String, String>> statePortals = {
    'CA_SURPLUS': {
      'name': 'California Surplus Property',
      'url': 'https://www.dgs.ca.gov/OFAM/Services/Page-Content/Office-of-Fleet-and-Asset-Management-Services-List-Folder/View-State-Surplus-Property-Auction-Online',
      'state': 'CA',
    },
    'CT_SURPLUS': {
      'name': 'Connecticut Surplus & Auctions',
      'url': 'https://portal.ct.gov/DAS/Services/Doing-Business-with-the-State/Surplus-and-Auctions',
      'state': 'CT',
    },
    'DE_SURPLUS': {
      'name': 'Delaware Surplus Auction',
      'url': 'https://gss.omb.delaware.gov/surplus/auction.shtml',
      'state': 'DE',
    },
    'IL_SURPLUS': {
      'name': 'Illinois Surplus',
      'url': 'https://www.illinois.gov/services/service.buy-surplus.html',
      'state': 'IL',
    },
    'MA_SURPLUS': {
      'name': 'Massachusetts Surplus Property',
      'url': 'https://www.mass.gov/surplus-property-program',
      'state': 'MA',
    },
    'MN_SURPLUS': {
      'name': 'Minnesota Surplus Property',
      'url': 'https://mn.gov/admin/citizen/surplus-property/',
      'state': 'MN',
    },
    'NC_SURPLUS': {
      'name': 'North Carolina Surplus Property',
      'url': 'https://www.doa.nc.gov/divisions/state-surplus-property',
      'state': 'NC',
    },
    'OR_SURPLUS': {
      'name': 'Oregon Surplus',
      'url': 'https://www.oregon.gov/das/surplus/pages/public-purchasing.aspx',
      'state': 'OR',
    },
    'TX_SURPLUS': {
      'name': 'Texas State Surplus',
      'url': 'https://www.tfc.texas.gov/divisions/supportserv/prog/statesurplus/',
      'state': 'TX',
    },
    'NY_SURPLUS': {
      'name': 'New York State Surplus Property',
      'url': 'https://ogs.ny.gov/state-surplus-property-program',
      'state': 'NY',
    },
    'FL_SURPLUS': {
      'name': 'Florida Surplus Property',
      'url': 'https://www.dms.myflorida.com/business_operations/state_purchasing/state_agency_resources/state_surplus_property',
      'state': 'FL',
    },
    'GA_SURPLUS': {
      'name': 'Georgia State Surplus Property',
      'url': 'https://doas.ga.gov/state-surplus-property',
      'state': 'GA',
    },
    'PA_SURPLUS': {
      'name': 'Pennsylvania Surplus Property',
      'url': 'https://www.dgs.pa.gov/Services/Surplus-Property/Pages/default.aspx',
      'state': 'PA',
    },
    'VA_SURPLUS': {
      'name': 'Virginia Surplus Property',
      'url': 'https://www.dgs.virginia.gov/Division-of-Purchases-and-Supply/Surplus-Property',
      'state': 'VA',
    },
    'WA_SURPLUS': {
      'name': 'Washington Surplus',
      'url': 'https://des.wa.gov/services/surplus',
      'state': 'WA',
    },
    'CO_SURPLUS': {
      'name': 'Colorado Surplus Property',
      'url': 'https://www.colorado.gov/pacific/dpa/surplus-property',
      'state': 'CO',
    },
    'OH_SURPLUS': {
      'name': 'Ohio Surplus',
      'url': 'https://das.ohio.gov/divisions/general-services/surplus',
      'state': 'OH',
    },
  };

  /// Get all available portals
  Future<List<Portal>> getAllPortals() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/trpc/portals.getAll'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final portals = (data['result']['data'] as List)
            .map((p) => Portal.fromJson(p as Map<String, dynamic>))
            .toList();
        return portals;
      }
      return _getLocalPortals();
    } catch (e) {
      print('Error fetching portals: $e');
      return _getLocalPortals();
    }
  }

  /// Get federal portals only
  Future<List<Portal>> getFederalPortals() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/trpc/portals.getFederal'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final portals = (data['result']['data'] as List)
            .map((p) => Portal.fromJson(p as Map<String, dynamic>))
            .toList();
        return portals;
      }
      return _getLocalFederalPortals();
    } catch (e) {
      print('Error fetching federal portals: $e');
      return _getLocalFederalPortals();
    }
  }

  /// Get state portals only
  Future<List<Portal>> getStatePortals() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/trpc/portals.getState'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final portals = (data['result']['data'] as List)
            .map((p) => Portal.fromJson(p as Map<String, dynamic>))
            .toList();
        return portals;
      }
      return _getLocalStatePortals();
    } catch (e) {
      print('Error fetching state portals: $e');
      return _getLocalStatePortals();
    }
  }

  /// Get portals by specific state
  Future<List<Portal>> getPortalsByState(String state) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/trpc/portals.getByState?state=$state'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final portals = (data['result']['data'] as List)
            .map((p) => Portal.fromJson(p as Map<String, dynamic>))
            .toList();
        return portals;
      }
      return [];
    } catch (e) {
      print('Error fetching portals for state $state: $e');
      return [];
    }
  }

  /// Get local portals (fallback when API is unavailable)
  List<Portal> _getLocalPortals() {
    final portals = <Portal>[];
    
    // Add federal portals
    federalPortals.forEach((id, data) {
      portals.add(Portal(
        id: id,
        name: data['name']!,
        url: data['url']!,
        category: 'federal',
        apiUrl: 'https://api.civicbid.com/api/trpc/auctions.search',
      ));
    });

    // Add state portals
    statePortals.forEach((id, data) {
      portals.add(Portal(
        id: id,
        name: data['name']!,
        url: data['url']!,
        category: 'state',
        apiUrl: 'https://api.civicbid.com/api/trpc/auctions.search',
        state: data['state'],
      ));
    });

    return portals;
  }

  /// Get local federal portals
  List<Portal> _getLocalFederalPortals() {
    final portals = <Portal>[];
    federalPortals.forEach((id, data) {
      portals.add(Portal(
        id: id,
        name: data['name']!,
        url: data['url']!,
        category: 'federal',
        apiUrl: 'https://api.civicbid.com/api/trpc/auctions.search',
      ));
    });
    return portals;
  }

  /// Get local state portals
  List<Portal> _getLocalStatePortals() {
    final portals = <Portal>[];
    statePortals.forEach((id, data) {
      portals.add(Portal(
        id: id,
        name: data['name']!,
        url: data['url']!,
        category: 'state',
        apiUrl: 'https://api.civicbid.com/api/trpc/auctions.search',
        state: data['state'],
      ));
    });
    return portals;
  }

  /// Get portal count by category
  Map<String, int> getPortalCounts() {
    return {
      'federal': federalPortalIds.length,
      'state': statePortalIds.length,
      'total': federalPortalIds.length + statePortalIds.length,
    };
  }

  /// Get portal by ID
  Portal? getPortalById(String id) {
    if (federalPortals.containsKey(id)) {
      final data = federalPortals[id]!;
      return Portal(
        id: id,
        name: data['name']!,
        url: data['url']!,
        category: 'federal',
        apiUrl: 'https://api.civicbid.com/api/trpc/auctions.search',
      );
    }

    if (statePortals.containsKey(id)) {
      final data = statePortals[id]!;
      return Portal(
        id: id,
        name: data['name']!,
        url: data['url']!,
        category: 'state',
        apiUrl: 'https://api.civicbid.com/api/trpc/auctions.search',
        state: data['state'],
      );
    }

    return null;
  }
}
