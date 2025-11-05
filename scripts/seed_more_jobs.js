import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobportal';

async function main(){
  try{
    await mongoose.connect(MONGO);
    console.log('Connected to MongoDB for seeding');
    const Job = (await import('../models/job.js')).default;

    const samples = [
      { title: 'Blockchain Developer', company: 'BlockWave', location: 'Bengaluru, India', description: 'Develop smart contracts and blockchain integrations.' },
      { title: 'SEO Specialist', company: 'SearchBoost', location: 'Remote', description: 'Improve organic search presence and growth.' },
      { title: 'IT Manager', company: 'InfraCore', location: 'Mumbai, India', description: 'Oversee IT operations and vendor management.' },
      { title: 'CRM Developer', company: 'SalesStack', location: 'Pune, India', description: 'Customize and maintain CRM solutions.' },
      { title: 'Game Developer', company: 'PlayForge', location: 'Hyderabad, India', description: 'Build interactive games using Unity or Unreal.' },
      { title: 'AR/VR Engineer', company: 'Immersa', location: 'Chennai, India', description: 'Develop immersive AR/VR experiences.' },
      { title: 'Automation Engineer', company: 'AutoFlow', location: 'Bangalore, India', description: 'Automate testing and deployment pipelines.' },
      { title: 'Research Scientist', company: 'LabNext', location: 'Chennai, India', description: 'Conduct experimental research in applied sciences.' },
      { title: 'Customer Success Manager', company: 'ClientFirst', location: 'Remote', description: 'Manage customer relationships and ensure retention.' },
      { title: 'Analytics Engineer', company: 'DataCraft', location: 'Hyderabad, India', description: 'Build analytics pipelines and data models.' }
    ];

    let inserted = 0;
    for (const s of samples){
      const exists = await Job.findOne({ title: s.title, company: s.company });
      if (!exists) {
        await Job.create(s);
        inserted++;
        console.log('Inserted:', s.title, '@', s.company);
      } else {
        console.log('Already exists:', s.title, '@', s.company);
      }
    }

    // ensure there are at least 25 jobs in total
    let total = await Job.countDocuments();
    const toGenerate = Math.max(0, 25 - total);
    if (toGenerate > 0) {
      console.log(`Only ${total} jobs present. Generating ${toGenerate} filler jobs to reach 25.`);
      const locations = ['Remote','Bengaluru, India','Chennai, India','Mumbai, India','Pune, India','Hyderabad, India'];
      const companies = ['DemoCorp','ExampleWorks','TechHouse','SoftWave','Alpha Solutions'];
      for (let i=0;i<toGenerate;i++){
        const idx = total + i + 1;
        const job = {
          title: `Sample Job ${idx}`,
          company: companies[idx % companies.length],
          location: locations[idx % locations.length],
          description: `This is a generated sample job #${idx} for testing and display purposes.`
        };
        await Job.create(job);
        inserted++;
        console.log('Generated:', job.title, '@', job.company);
      }
    }

    total = await Job.countDocuments();
    console.log(`Seeding complete. Inserted ${inserted} new jobs. Total jobs now: ${total}`);
    process.exit(0);
  }catch(err){
    console.error('Seeding error', err);
    process.exit(1);
  }
}

main();
