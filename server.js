const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
const port = 8085;

app.use(cors());
app.use(express.json());

const dbConfig = {
    server: "localhost",
    database: "master",
    user: "Kesem1405",
    password: "Ke$em123",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};


app.get("/customers", async (req, res) => {
    const { companyName, contactName, phone } = req.query;

    try {
        await sql.connect(dbConfig);

        let query = `
            SELECT c.CustomerID, c.CompanyName, c.ContactName, c.Phone, c.Address,
                   COUNT(o.OrderID) AS totalOrders
            FROM Customers c
            LEFT JOIN Orders o ON c.CustomerID = o.CustomerID
            WHERE 1=1`;

        if (companyName) query += ` AND c.CompanyName LIKE '${companyName}%'`;
        if (contactName) query += ` AND c.ContactName LIKE '${contactName}%'`;
        if (phone) query += ` AND c.Phone LIKE '${phone}%'`;

        query += `
            GROUP BY c.CustomerID, c.CompanyName, c.ContactName, c.Phone, c.Address
            ORDER BY c.CompanyName`;

        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error executing SQL query: ", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
