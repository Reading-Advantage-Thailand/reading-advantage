// route
// api/
export async function GET() {
    return new Response(JSON.stringify({
        message: 'Hello from the Reading Advantage API!',
    }), { status: 200 })
}