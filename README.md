# 401k Portal

A React application for viewing and managing 401(k) investments. This portal provides a user-friendly interface for account holders to monitor and adjust their retirement investments.

## Features

- View current investment allocations and balances
- Transfer funds between investment options
- Reallocate investment percentages across funds
- Transaction history and reporting
- Secure authentication and authorization

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/401k-portal.git
cd 401k-portal
npm install
```

## Usage

### Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build

Create a production build:

```bash
npm run build
```

## Business Rules

### Fund Transfer Rules
- Users can only transfer funds between eligible investment options
- Transfers must maintain a positive balance in source funds
- Transfer amounts must be greater than $0
- Users cannot transfer more than their available balance
- Fund transfers maintain investment type buckets (e.g., traditional 401k funds transfer to traditional 401k funds)

### Fund Reallocation Rules
- Total allocation across all funds must equal 100%
- Allocation percentages must be between 0% and 100%

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](https://choosealicense.com/licenses/mit/) file for details.

## Security

This application is designed for demonstration purposes. In a production environment, ensure proper security measures are implemented to protect sensitive financial information.
