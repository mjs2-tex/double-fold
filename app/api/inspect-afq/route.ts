export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const inspectId = searchParams.get("production_name") || "";

    if (!inspectId) {
        return NextResponse.json(
            {
                success: false,
                message: "Parameter inspect_id wajib diisi",
            },
            { status: 400 }
        );
    }

    try {
        const queryMater = `
            select d."name" as nama_produk, e."ref" as nama_om, a.no_batch,f."name" as nama_warna, a.pick_finish, a.purpose, g."name", a."date" from produksi_inspect a
left JOIN
mrp_production b on a.production_id = b.id
left JOIN
product_product c on a.product_id = c."id"
left JOIN
product_template d on c.product_tmpl_id = d.id
left JOIN
sale_order e on b.sale_id = e."id"
left JOIN
product_attribute_value f on b.color_id = f.id
left JOIN
hr_employee g on a.employee_id = g."id"
where b.name = $1
        `;

        const query = `
      SELECT 
    a.id,
    a.no_piece, 
    a.quantity,
    e.color_id,
    a.grade_id,
    COALESCE(NULLIF(e.warna_custom, ''), f.name) AS warna_produk,
    c.name AS nama_produk,
    d.name AS production_name,
    g.name as no_lot,
    h.name as nama_grade,
    -- Perbaikan Subquery untuk menggabungkan waste
    (
        SELECT STRING_AGG(pw.code || ' - ' || pw.name, ', ') 
        FROM detail_waste dw
        LEFT JOIN product_waste pw ON dw.waste_id = pw.id 
        WHERE dw.stock_move_line_before_id = a.id -- Menghubungkan ke ID baris utama
    ) AS keterangan
FROM stock_move_line_before AS a
INNER JOIN product_product AS b ON a.product_id = b.id
INNER JOIN product_template AS c ON b.product_tmpl_id = c.id
INNER JOIN mrp_production AS d ON a.production_id = d.id
INNER JOIN produksi_inspect AS e ON a.inspect_id = e.id
INNER JOIN product_attribute_value AS f ON e.color_id = f.id
left join stock_production_lot as g on a.lot_id = g.id
left JOIN makloon_grade h on a.grade_id = h.id
WHERE d.name = $1
ORDER BY a.id;
    `;

        const { rows } = await pool.query(query, [inspectId]);
        const { rows: rowsMater } = await pool.query(queryMater, [inspectId]);

        let currentRollNumber = 0;

        const mod = rows.map((item: any) => {
            // Kondisi: grade_id bukan 3 DAN quantity >= 15
            // (Asumsi grade_id 3 adalah BS berdasarkan logika Anda)
            const isValidRoll = item.grade_id !== 3 && item.quantity >= 15;

            if (isValidRoll) {
                currentRollNumber++; // Naikkan nomor roll hanya jika valid
                return {
                    ...item,
                    no_piece: currentRollNumber, // Isi dengan nomor urut
                };
            } else {
                return {
                    ...item,
                    no_piece: "", // Kosongkan atau beri null jika tidak memenuhi syarat (seperti baris BS)
                };
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...rowsMater[0],
                details: mod,
            },
        });
    } catch (error: any) {
        console.error("DB ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    }
}
