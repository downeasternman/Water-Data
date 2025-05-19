# Water Data App

A React Native/Expo application for monitoring water conditions using real-time data from the United States Geological Survey (USGS).

## Features

- Real-time water temperature and discharge monitoring
- Offline support with local data caching
- Pull-to-refresh functionality
- Automatic data refresh every 4 hours
- Beautiful and intuitive user interface
- Support for both iOS and Android platforms

## Data Sources

The app fetches data from USGS water services API:
- Temperature data from site 01021050
- Discharge data from site 01021000

## Technical Stack

- React Native/Expo
- TypeScript
- React Navigation
- React Native Paper (UI components)
- Expo SQLite (local data storage)
- Axios (API requests)
- React Native NetInfo (network status)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd WaterDataApp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Run on your preferred platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

## Project Structure

```
WaterDataApp/
├── src/
│   ├── api/          # API integration
│   ├── components/   # Reusable UI components
│   ├── constants/    # App constants and theme
│   ├── database/     # SQLite database operations
│   ├── screens/      # App screens
│   ├── types/        # TypeScript type definitions
│   └── App.tsx       # Root component
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- USGS for providing the water data API
- Expo team for the amazing development platform
- React Native community for the excellent tools and libraries
