import 'dotenv/config';
import { Client } from '@notionhq/client';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { CV } from '../models/CV.js';
import { Package } from '../models/Package.js';

const notion = new Client({ auth: process.env.NOTION_API_KEY || 'your_notion_api_key' });
const PARENT_PAGE_ID = '099a8048-af8b-4948-adee-0d43bf6400ff';

async function createOverviewPage() {
  console.log('Creating Overview Page...');
  const response = await notion.pages.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    properties: {
      title: {
        title: [{ text: { content: 'SpeakAI Project Overview & Architecture' } }]
      }
    },
    children: [
      {
        heading_2: { rich_text: [{ text: { content: 'Tech Stack' } }] }
      },
      {
        bulleted_list_item: { rich_text: [{ text: { content: 'Frontend: React, Vite, TailwindCSS (assumed)' } }] }
      },
      {
        bulleted_list_item: { rich_text: [{ text: { content: 'Backend: Node.js, Express, TypeScript' } }] }
      },
      {
        bulleted_list_item: { rich_text: [{ text: { content: 'Database: MongoDB with Mongoose' } }] }
      },
      {
        heading_2: { rich_text: [{ text: { content: 'Folder Structure' } }] }
      },
      {
        paragraph: { rich_text: [{ text: { content: 'Frontend: /frontend/src (components, pages, lib)' } }] }
      },
      {
        paragraph: { rich_text: [{ text: { content: 'Backend: /backend/src (controllers, models, routes, services)' } }] }
      }
    ]
  });
  console.log('Overview page created:', response.url);
}

async function createUsersDatabase() {
  console.log('Creating Users Database...');
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ type: 'text', text: { content: 'Users (MongoDB)' } }],
    properties: {
      Name: { title: {} },
      Email: { email: {} },
      Role: { select: { options: [{ name: 'admin', color: 'red' }, { name: 'user', color: 'blue' }] } },
      ExperienceLevel: { rich_text: {} },
      TotalXP: { number: { format: 'number' } },
      CreatedAt: { date: {} }
    }
  });

  const users = await User.find().limit(50);
  console.log(`Found ${users.length} users. Pushing to Notion...`);
  
  for (const user of users) {
    try {
      await notion.pages.create({
        parent: { type: 'database_id', database_id: db.id },
        properties: {
          Name: { title: [{ text: { content: user.name || 'No Name' } }] },
          Email: { email: user.email },
          Role: { select: { name: user.role } },
          ExperienceLevel: { rich_text: [{ text: { content: user.experienceLevel || '' } }] },
          TotalXP: { number: user.totalXp },
          CreatedAt: { date: { start: new Date(user.createdAt).toISOString() } }
        }
      });
    } catch (err: any) {
      console.error('Failed to create user page:', err.message);
    }
  }
  console.log('Users Database populated:', db.url);
}

async function createCVDatabase() {
  console.log('Creating CV Database...');
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ type: 'text', text: { content: 'CVs (MongoDB)' } }],
    properties: {
      FileName: { title: {} },
      FileURL: { url: {} },
      IsDefault: { checkbox: {} }
    }
  });

  const cvs = await CV.find().limit(50);
  console.log(`Found ${cvs.length} CVs. Pushing to Notion...`);
  
  for (const cv of cvs) {
    try {
      await notion.pages.create({
        parent: { type: 'database_id', database_id: db.id },
        properties: {
          FileName: { title: [{ text: { content: cv.fileName } }] },
          FileURL: { url: cv.fileUrl },
          IsDefault: { checkbox: cv.isDefault }
        }
      });
    } catch (err: any) {
      console.error('Failed to create cv page:', err.message);
    }
  }
  console.log('CVs Database populated:', db.url);
}

async function createPackagesDatabase() {
  console.log('Creating Packages Database...');
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ type: 'text', text: { content: 'Packages (MongoDB)' } }],
    properties: {
      Name: { title: {} },
      Price: { number: { format: 'number' } },
      Period: { select: {} },
      Active: { checkbox: {} }
    }
  });

  const packages = await Package.find().limit(50);
  console.log(`Found ${packages.length} packages. Pushing to Notion...`);
  
  for (const pkg of packages) {
    try {
      await notion.pages.create({
        parent: { database_id: db.id },
        properties: {
          Name: { title: [{ text: { content: pkg.name } }] },
          Price: { number: pkg.price },
          Period: { select: { name: pkg.period } },
          Active: { checkbox: pkg.active }
        }
      });
    } catch (err: any) {
      console.error('Failed to create package page:', err.message);
    }
  }
  console.log('Packages Database populated:', db.url);
}

async function main() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/speakai';
    console.log('Connecting to MongoDB...', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    await createOverviewPage();
    await createUsersDatabase();
    await createCVDatabase();
    await createPackagesDatabase();
    
    console.log('Export to Notion completed successfully.');
  } catch (error) {
    console.error('Error during export:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
