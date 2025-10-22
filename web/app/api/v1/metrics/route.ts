import { NextRequest, NextResponse } from "next/server";
import { createEdgeRouter } from "next-connect";
import { logRequest } from "@/server/middleware";
import { protect } from "@/server/controllers/auth-controller";

interface RequestContext {
  params?: unknown;
}

const router = createEdgeRouter<NextRequest, RequestContext>();

// Middleware
router.use(logRequest);
router.use(protect);

// GET /api/v1/metrics - Aggregate metrics endpoint
router.get(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const dateRange = url.searchParams.get("dateRange") || "30d";
    const filter = url.searchParams.get("filter");

    // Base URL for internal API calls
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    
    // Prepare headers for internal requests
    const headers = {
      'Authorization': req.headers.get('Authorization') || '',
      'Cookie': req.headers.get('Cookie') || '',
    };

    const params = new URLSearchParams({ dateRange });
    
    // Fetch specific metric if filter is provided
    if (filter && filter !== "all") {
      let apiUrl = `${baseUrl}/api/v1/metrics/${filter}?${params}`;
      
      // Add special parameters for specific endpoints
      if (filter === 'velocity') {
        apiUrl += '&scope=school';
      }
      
      const response = await fetch(apiUrl, {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ [filter]: data });
      } else {
        throw new Error(`Failed to fetch ${filter} metrics`);
      }
    }

    // Fetch all metrics
    const endpoints = [
      { endpoint: 'activity', params: '' },
      { endpoint: 'genres', params: '' },
      { endpoint: 'health', params: '' },
      { endpoint: 'assignments', params: '' },
      { endpoint: 'velocity', params: '&scope=school', optional: true },
      { endpoint: 'srs', params: '', optional: true }
    ];

    const promises = endpoints.map(async (item) => {
      const { endpoint, params: extraParams, optional = false } = item;
      
      try {
        const response = await fetch(`${baseUrl}/api/v1/metrics/${endpoint}?${params}${extraParams}`, {
          headers,
        });
        
        if (response.ok) {
          const data = await response.json();
          return { [endpoint]: data };
        } else {
          console.warn(`Failed to fetch ${endpoint} metrics:`, response.status, response.statusText);
          if (optional) {
            return { [endpoint]: null };
          } else {
            throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
          }
        }
      } catch (error) {
        console.warn(`Error fetching ${endpoint} metrics:`, error);
        if (optional) {
          return { [endpoint]: null };
        } else {
          return { [endpoint]: { error: String(error) } };
        }
      }
    });

    const results = await Promise.all(promises);
    
    // Combine all results into a single object
    const combinedData = results.reduce((acc, result) => {
      return { ...acc, ...result };
    }, {});

    return NextResponse.json(combinedData);
    
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
});

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}