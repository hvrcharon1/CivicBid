import { describe, it, expect } from "vitest";
import {
  getAvailablePortals,
  getPortalsByCategory,
  getPortalsByState,
  AUCTION_PORTALS,
} from "./aggregation";

describe("Portal Management", () => {
  describe("getAvailablePortals", () => {
    it("should return all available portals", () => {
      const portals = getAvailablePortals();
      expect(portals.length).toBeGreaterThan(0);
      expect(portals.length).toBe(Object.keys(AUCTION_PORTALS).length);
    });

    it("should include required portal properties", () => {
      const portals = getAvailablePortals();
      portals.forEach((portal) => {
        expect(portal).toHaveProperty("id");
        expect(portal).toHaveProperty("name");
        expect(portal).toHaveProperty("url");
        expect(portal).toHaveProperty("category");
        expect(portal).toHaveProperty("apiUrl");
      });
    });

    it("should include federal portals", () => {
      const portals = getAvailablePortals();
      const federalPortals = portals.filter((p) => p.category === "federal");
      expect(federalPortals.length).toBeGreaterThan(0);
      expect(federalPortals.length).toBe(10); // 10 federal portals
    });

    it("should include state portals", () => {
      const portals = getAvailablePortals();
      const statePortals = portals.filter((p) => p.category === "state");
      expect(statePortals.length).toBeGreaterThan(0);
      expect(statePortals.length).toBe(17); // 17 state portals
    });
  });

  describe("getPortalsByCategory", () => {
    it("should return only federal portals when category is federal", () => {
      const portals = getPortalsByCategory("federal");
      expect(portals.length).toBe(10);
      portals.forEach((portal) => {
        expect(portal.category).toBe("federal");
      });
    });

    it("should return only state portals when category is state", () => {
      const portals = getPortalsByCategory("state");
      expect(portals.length).toBe(17);
      portals.forEach((portal) => {
        expect(portal.category).toBe("state");
      });
    });

    it("should include GSA Auctions in federal portals", () => {
      const portals = getPortalsByCategory("federal");
      const gsaAuctions = portals.find((p) => p.id === "GSA_AUCTIONS");
      expect(gsaAuctions).toBeDefined();
      expect(gsaAuctions?.name).toBe("GSA Auctions");
      expect(gsaAuctions?.url).toBe("https://www.gsaauctions.gov/auctions/home");
    });

    it("should include HUD Home Store in federal portals", () => {
      const portals = getPortalsByCategory("federal");
      const hudHomes = portals.find((p) => p.id === "HUD_HOMES");
      expect(hudHomes).toBeDefined();
      expect(hudHomes?.name).toBe("HUD Home Store");
    });

    it("should include US Marshals in federal portals", () => {
      const portals = getPortalsByCategory("federal");
      const marshals = portals.find((p) => p.id === "US_MARSHALS");
      expect(marshals).toBeDefined();
      expect(marshals?.name).toBe("US Marshals Asset Forfeiture");
    });
  });

  describe("getPortalsByState", () => {
    it("should return California portals", () => {
      const portals = getPortalsByState("CA");
      expect(portals.length).toBe(1);
      expect(portals[0].name).toBe("California Surplus Property");
    });

    it("should return Texas portals", () => {
      const portals = getPortalsByState("TX");
      expect(portals.length).toBe(1);
      expect(portals[0].name).toBe("Texas State Surplus");
    });

    it("should return New York portals", () => {
      const portals = getPortalsByState("NY");
      expect(portals.length).toBe(1);
      expect(portals[0].name).toBe("New York State Surplus Property");
    });

    it("should return Florida portals", () => {
      const portals = getPortalsByState("FL");
      expect(portals.length).toBe(1);
      expect(portals[0].name).toBe("Florida Surplus Property");
    });

    it("should return empty array for non-existent state", () => {
      const portals = getPortalsByState("XX");
      expect(portals.length).toBe(0);
    });

    it("should have state property for state portals", () => {
      const caPortals = getPortalsByState("CA");
      caPortals.forEach((portal) => {
        expect((portal as any).state).toBe("CA");
      });
    });
  });

  describe("Portal URLs", () => {
    it("should have valid URLs for all portals", () => {
      const portals = getAvailablePortals();
      portals.forEach((portal) => {
        expect(portal.url).toMatch(/^https?:\/\//);
      });
    });

    it("should have valid API URLs for all portals", () => {
      const portals = getAvailablePortals();
      portals.forEach((portal) => {
        expect(portal.apiUrl).toMatch(/^https?:\/\//);
      });
    });
  });

  describe("Portal Coverage", () => {
    it("should cover all major federal auction sources", () => {
      const federalPortals = getPortalsByCategory("federal");
      const portalNames = federalPortals.map((p) => p.id);

      expect(portalNames).toContain("GSA_AUCTIONS");
      expect(portalNames).toContain("REAL_ESTATE_SALES");
      expect(portalNames).toContain("USA_AUCTIONS");
      expect(portalNames).toContain("USA_CAR_AUCTIONS");
      expect(portalNames).toContain("TREASURY_AUCTIONS");
      expect(portalNames).toContain("US_MARSHALS");
      expect(portalNames).toContain("HUD_HOMES");
      expect(portalNames).toContain("FDIC_REAL_ESTATE");
      expect(portalNames).toContain("BLM_LAND_SALES");
    });

    it("should cover all major state auction sources", () => {
      const statePortals = getPortalsByCategory("state");
      const states = statePortals.map((p) => (p as any).state);

      expect(states).toContain("CA");
      expect(states).toContain("TX");
      expect(states).toContain("NY");
      expect(states).toContain("FL");
      expect(states).toContain("PA");
      expect(states).toContain("IL");
      expect(states).toContain("OH");
      expect(states).toContain("GA");
      expect(states).toContain("NC");
      expect(states).toContain("VA");
      expect(states).toContain("WA");
      expect(states).toContain("CO");
      expect(states).toContain("MA");
      expect(states).toContain("MN");
      expect(states).toContain("OR");
      expect(states).toContain("CT");
      expect(states).toContain("DE");
    });
  });

  describe("Portal Uniqueness", () => {
    it("should have unique portal IDs", () => {
      const portals = getAvailablePortals();
      const ids = portals.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have unique portal names", () => {
      const portals = getAvailablePortals();
      const names = portals.map((p) => p.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it("should have unique portal URLs", () => {
      const portals = getAvailablePortals();
      const urls = portals.map((p) => p.url);
      const uniqueUrls = new Set(urls);
      expect(uniqueUrls.size).toBe(urls.length);
    });
  });
});
