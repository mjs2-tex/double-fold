export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {pool} from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productionName = searchParams.get("production_name") || "";

  if (!productionName) {
    return NextResponse.json(
      {
        success: false,
        message: "Parameter production_name wajib diisi",
      },
      { status: 400 }
    );
  }

  try {
    const query = `
      SELECT 
        d.name
      FROM stock_move_line_before AS a
      INNER JOIN product_product AS b 
        ON a.product_id = b.id
      INNER JOIN product_template AS c 
        ON b.product_tmpl_id = c.id
      INNER JOIN mrp_production AS d 
        ON a.production_id = d.id
      WHERE d.name = $1
      LIMIT 1
    `;

    
    const { rows } = await pool.query(query, [productionName]);
    console.log(rows);

    return NextResponse.json({
      success: true,
      production_name: rows.length > 0 ? rows[0].name : null,
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
