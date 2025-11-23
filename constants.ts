import { BuildingContext } from "./types";

export const APP_VERSION = "1.0.0-web";

export const MOCK_BUILDINGS = [
  { id: 'b1', name: 'Skyline Heights' },
  { id: 'b2', name: 'Riverside Commons' },
  { id: 'b3', name: 'Tech Park Plaza' },
];

export const MOCK_FLOORS = [
  { id: 'f1', name: 'Ground Floor' },
  { id: 'f2', name: '2nd Floor' },
  { id: 'f3', name: '3rd Floor' },
];

export const MOCK_ROOMS = [
  { id: 'r101', name: 'Room 101' },
  { id: 'r102', name: 'Room 102' },
  { id: 'r103', name: 'Conference Room A' },
  { id: 'r104', name: 'Server Room' },
];

export const DEFAULT_CONTEXT: BuildingContext = {
  buildingId: '',
  floorId: '',
  roomId: ''
};