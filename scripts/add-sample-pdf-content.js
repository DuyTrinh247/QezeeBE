const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || "qezee",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "password",
});

async function addSamplePdfContent() {
  const client = await pool.connect();

  try {
    console.log("🚀 Adding sample PDF content...");

    // Get the first PDF file
    const pdfFiles = await client.query(`
      SELECT id, original_name 
      FROM pdf_files 
      WHERE content IS NULL 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    if (pdfFiles.rows.length === 0) {
      console.log("No PDF files found to update");
      return;
    }

    const pdfFile = pdfFiles.rows[0];
    console.log(`Updating PDF file: ${pdfFile.original_name} (${pdfFile.id})`);

    // Sample PDF content (IELTS Reading Test content)
    const sampleContent = `
      <h1>IELTS Reading Test 2</h1>
      
      <h2>Reading Passage 1</h2>
      <h3>The Impact of Artificial Intelligence on Healthcare</h3>
      
      <p>Artificial Intelligence (AI) is revolutionizing the healthcare industry in unprecedented ways. From diagnostic tools to treatment recommendations, AI systems are becoming increasingly sophisticated and reliable. This transformation is not just a technological advancement but a fundamental shift in how medical professionals approach patient care.</p>
      
      <p>One of the most significant applications of AI in healthcare is medical imaging. Machine learning algorithms can now analyze X-rays, MRIs, and CT scans with accuracy that often matches or exceeds human radiologists. These systems can detect early signs of diseases such as cancer, often identifying patterns that might be missed by the human eye.</p>
      
      <p>Another area where AI is making a substantial impact is in drug discovery and development. Traditional drug development processes can take over a decade and cost billions of dollars. AI-powered systems can analyze vast amounts of molecular data to identify potential drug candidates much faster and more efficiently.</p>
      
      <h2>Reading Passage 2</h2>
      <h3>Climate Change and Its Effects on Global Agriculture</h3>
      
      <p>Climate change represents one of the most pressing challenges of our time, with far-reaching implications for global agriculture. Rising temperatures, changing precipitation patterns, and increased frequency of extreme weather events are already affecting crop yields and food security worldwide.</p>
      
      <p>Research indicates that climate change could reduce global crop yields by 2-6% per decade, with some regions experiencing much more severe impacts. Developing countries, which often rely heavily on agriculture for their economies, are particularly vulnerable to these changes.</p>
      
      <p>However, there are also opportunities for adaptation. New crop varieties that are more resistant to drought and heat stress are being developed. Precision agriculture techniques, enabled by satellite technology and AI, can help farmers optimize their water and fertilizer use, making agriculture more sustainable and resilient.</p>
      
      <h2>Reading Passage 3</h2>
      <h3>The Future of Work in the Digital Age</h3>
      
      <p>The digital revolution is fundamentally changing the nature of work. Automation, artificial intelligence, and remote working technologies are reshaping industries and creating new opportunities while also displacing traditional jobs.</p>
      
      <p>While some jobs are being automated away, new types of jobs are emerging. The World Economic Forum estimates that by 2025, 85 million jobs may be displaced by automation, but 97 million new jobs may emerge that are more adapted to the new division of labor between humans, machines, and algorithms.</p>
      
      <p>This transformation requires significant investment in education and training. Workers need to develop new skills to remain relevant in the changing economy. Governments, educational institutions, and businesses all have roles to play in ensuring that workers can adapt to these changes.</p>
    `;

    // Update the PDF file with content
    await client.query(`
      UPDATE pdf_files 
      SET 
        content = $1,
        content_extracted_at = CURRENT_TIMESTAMP,
        content_length = $2
      WHERE id = $3
    `, [sampleContent, sampleContent.length, pdfFile.id]);

    console.log("✅ Sample PDF content added successfully!");
    console.log(`Content length: ${sampleContent.length} characters`);

    // Verify the update
    const updatedFile = await client.query(`
      SELECT id, original_name, content_length, content_extracted_at
      FROM pdf_files 
      WHERE id = $1
    `, [pdfFile.id]);

    console.log("\n📋 Updated PDF file:");
    console.log(`  ID: ${updatedFile.rows[0].id}`);
    console.log(`  Name: ${updatedFile.rows[0].original_name}`);
    console.log(`  Content Length: ${updatedFile.rows[0].content_length}`);
    console.log(`  Extracted At: ${updatedFile.rows[0].content_extracted_at}`);

  } catch (error) {
    console.error("❌ Error adding sample PDF content:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addSamplePdfContent();
