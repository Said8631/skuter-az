import { NextResponse } from 'next/server';
import { mockScooters } from '../../../data/mockScooters';

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json({
    success: true,
    data: mockScooters
  });
}
