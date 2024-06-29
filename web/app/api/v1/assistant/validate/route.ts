import db from "@/configs/firestore-config";
import { logRequest } from "@/utils/middleware";
import validator from "@/utils/validator";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";

const router = createEdgeRouter<NextRequest, { context?: unknown }>();

router.use(logRequest);

router.post(async (req: NextRequest, context: unknown) => {
    try {
        const { ids, filterDate }: { ids: string[], filterDate: string } = await req.json();

        if (!ids && filterDate) {
            // Validate date format
            if (!filterDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return NextResponse.json({ error: "Invalid date format (YYYY-MM-DD)" }, { status: 400 });
            }

            // Generate start and end dates
            const startDate = new Date(filterDate);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);

            const isoStartDate = startDate.toISOString();
            const isoEndDate = endDate.toISOString();

            // Query database for articles within date range
            const query = db.collection("new-articles")
                .where("created_at", ">=", isoStartDate)
                .where("created_at", "<", isoEndDate);
            const snapshot = await query.get();

            // Validate articles
            const validators = snapshot.docs.map((doc) => doc.id);
            const validate = await Promise.all(validators.map((id) => validator(id)));

            // Run only first 1 for testing
            // const validate = await Promise.all([validators[2]].map((id) => validator(id)));
            // Count validation results
            const countAllPass = validate.filter((val) => val.validation.every((v: string) => v.includes("pass"))).length;
            const countAllFail = validate.filter((val) => val.validation.some((v: string) => v.includes("regenerated"))).length;

            return NextResponse.json({
                start_date: isoStartDate,
                end_date: isoEndDate,
                length: snapshot.docs.length,
                count_all_pass: countAllPass,
                count_all_fail: countAllFail,
                validate,
            }, { status: 200 });
        } else if (ids) {
            // Validate articles by ids
            const validate = await Promise.all(ids.map((id) => validator(id)));

            // Count validation results
            const countAllPass = validate.filter((val) => val.validation.every((v: string) => v.includes("pass"))).length;
            const countAllFail = validate.filter((val) => val.validation.some((v: string) => v.includes("regenerated"))).length;

            return NextResponse.json({
                length: ids.length,
                count_all_pass: countAllPass,
                count_all_fail: countAllFail,
                validate,
            }, { status: 200 });
        } else {
            return NextResponse.json({ error: "No valid input provided" }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error }, { status: 400 });
    }
});

export async function POST(request: NextRequest, ctx: { context?: unknown }): Promise<NextResponse> {
    const result = await router.run(request, ctx);
    if (result instanceof NextResponse) {
        return result;
    }
    throw new Error("Expected a NextResponse from router.run");
}