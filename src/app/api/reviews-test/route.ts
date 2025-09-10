import { NextRequest, NextResponse } from "next/server";

// Mock de conexión a BD - reemplaza con tu cliente real (Supabase, etc.)
async function executeQuery(sql: string, params: any[] = []): Promise<any> {
  // TODO: Reemplazar con tu conexión real a BD
  // Ejemplo para Supabase:
  // const { createClient } = require('@supabase/supabase-js');
  // const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  // return await supabase.rpc('execute_sql', { query: sql, params });

  console.log("SQL Query:", sql);
  console.log("Params:", params);

  // Mock response
  return {
    rows: [
      {
        id: "mock-id-" + Math.random().toString(36).substring(7),
        ...params,
      },
    ],
    rowCount: 1,
  };
}

// POST: Insertar datos de prueba
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const results = [];

    switch (action) {
      case "insert_users": {
        for (const user of data) {
          const result = await executeQuery(
            `
            INSERT INTO users (wallet_address, username, name, email, is_freelancer, bio)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, is_freelancer, created_at
          `,
            [
              user.wallet_address,
              user.username,
              user.name,
              user.email,
              user.is_freelancer,
              user.bio,
            ],
          );
          results.push(result.rows[0]);
        }
        break;
      }

      case "insert_contracts": {
        for (const contract of data) {
          const result = await executeQuery(
            `
            INSERT INTO contracts (contract_type, freelancer_id, client_id, contract_on_chain_id, escrow_status, amount_locked)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, freelancer_id, client_id, created_at
          `,
            [
              contract.contract_type,
              contract.freelancer_id,
              contract.client_id,
              contract.contract_on_chain_id,
              contract.escrow_status,
              contract.amount_locked,
            ],
          );
          results.push(result.rows[0]);
        }
        break;
      }

      case "insert_reviews": {
        for (const review of data) {
          const result = await executeQuery(
            `
            INSERT INTO reviews (from_user_id, to_user_id, contract_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, from_user_id, to_user_id, rating, created_at
          `,
            [
              review.from_user_id,
              review.to_user_id,
              review.contract_id,
              review.rating,
              review.comment,
            ],
          );
          results.push(result.rows[0]);
        }
        break;
      }

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Action not supported. Use: insert_users, insert_contracts, insert_reviews",
          },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      message: `${action} completed successfully`,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET: Obtener datos para verificar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "get_all";
    const userId = searchParams.get("user_id");

    let result;

    switch (action) {
      case "get_users": {
        result = await executeQuery(`
          SELECT id, name, username, is_freelancer, created_at
          FROM users 
          ORDER BY created_at DESC 
          LIMIT 50
        `);
        break;
      }

      case "get_contracts": {
        result = await executeQuery(`
          SELECT id, contract_type, freelancer_id, client_id, escrow_status, amount_locked, created_at
          FROM contracts 
          ORDER BY created_at DESC 
          LIMIT 50
        `);
        break;
      }

      case "get_reviews": {
        if (userId) {
          result = await executeQuery(
            `
            SELECT r.id, r.from_user_id, r.to_user_id, r.contract_id, r.rating, r.comment, r.created_at,
                   u_from.name as from_user_name, u_to.name as to_user_name
            FROM reviews r
            JOIN users u_from ON r.from_user_id = u_from.id
            JOIN users u_to ON r.to_user_id = u_to.id
            WHERE r.to_user_id = $1
            ORDER BY r.created_at DESC
          `,
            [userId],
          );
        } else {
          result = await executeQuery(`
            SELECT r.id, r.from_user_id, r.to_user_id, r.contract_id, r.rating, r.comment, r.created_at,
                   u_from.name as from_user_name, u_to.name as to_user_name
            FROM reviews r
            JOIN users u_from ON r.from_user_id = u_from.id
            JOIN users u_to ON r.to_user_id = u_to.id
            ORDER BY r.created_at DESC 
            LIMIT 50
          `);
        }
        break;
      }

      case "get_stats": {
        const usersResult = await executeQuery(
          "SELECT COUNT(*) as count FROM users",
        );
        const contractsResult = await executeQuery(
          "SELECT COUNT(*) as count FROM contracts",
        );
        const reviewsResult = await executeQuery(
          "SELECT COUNT(*) as count FROM reviews",
        );
        const avgRatingResult = await executeQuery(
          "SELECT AVG(rating::numeric) as avg_rating FROM reviews",
        );

        result = {
          rows: [
            {
              total_users: usersResult.rows[0].count,
              total_contracts: contractsResult.rows[0].count,
              total_reviews: reviewsResult.rows[0].count,
              average_rating: avgRatingResult.rows[0].avg_rating,
            },
          ],
        };
        break;
      }

      default: {
        // Get all summary
        const users = await executeQuery("SELECT COUNT(*) as count FROM users");
        const contracts = await executeQuery(
          "SELECT COUNT(*) as count FROM contracts",
        );
        const reviews = await executeQuery(
          "SELECT COUNT(*) as count FROM reviews",
        );

        result = {
          rows: [
            {
              summary: {
                users: users.rows[0].count,
                contracts: contracts.rows[0].count,
                reviews: reviews.rows[0].count,
              },
            },
          ],
        };
        break;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${action} completed successfully`,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
