import "dotenv/config";
import app from "./application/app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

//test 1234567
