# Ahjoor Savings

Ahjoor Savings is a community savings platform that helps people save money together in groups called savings circles. Think of it like a digital "tontine" where friends, family, or community members pool their money and take turns receiving the total amount.

**What is a Savings Circle?**
- A group of people who agree to save a fixed amount regularly (weekly/monthly)
- Each member takes turns receiving the entire pool when it's their turn
- Everyone gets their chance to receive a lump sum, making it easier to reach financial goals

Built with Next.js, Tailwind CSS, and powered by Starknet blockchain technology for security and transparency.

### CONTRACT_ADDRESS = "0x0794fb034e45f9a538ea4dfbbc93378fe49e32542ad55425de69832ec905c853";

### CONTRACT REPO= https://github.com/ussyalfaks/ahjoor
---

## 🚀 How to Run Locally

Want to try it out on your computer? Here's how:

### 1. First, install the required packages
```bash
npm install or npm install --legacy-peer-deps
```

### 2. Start the development server
```bash
npm run dev
```

### 3. Open your browser
Go to [http://localhost:3000](http://localhost:3000) and you'll see the app running!

---

## ✨ What You Can Do

- 🔗 **Connect Your Wallet** – works with Argent X & Braavos wallets
- 👥 **Create a Savings Circle** – start a new group with your friends or community  
- 💰 **Make Regular Contributions** – save your agreed amount each period
- 🎯 **Receive Your Payout** – get the full pool amount when it's your turn
- 📊 **Track Progress** – see how your circle is doing with a clean, easy-to-use interface

---

## 📜 Smart Contract Functions

The contract is written in **Cairo** and deployed to Starknet Sepolia Testnet.

- `create_group(name, description, num_participants, contribution_amount, round_duration, participant_addresses)`
- `contribute(group_id)`
- `claim_payout(group_id)`
- `get_group_info(group_id)`
- `get_group_count()`

---

## 🛠️ Tech Stack

| Layer      | Technology             |
| ---------- | ---------------------- |
| Frontend   | Next.js 15, TypeScript |
| UI         | Tailwind CSS           |
| Blockchain | Starknet, Cairo        |
| Wallets    | Argent X, Braavos      |
| State      | React Hooks            |

---

## 🗂 Project Structure

```
frontend/
├── app/                # App router pages
├── components/         # React components
├── constants/          # Contract ABI and addresses
└── README.md
```

---

## 🔗 Resources

- [Starknet Docs](https://docs.starknet.io/)
- [Cairo Book](https://book.cairo-lang.org/)
- [Starknet React](https://github.com/apibara/starknet-react)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## 👩🏾‍💻 About

Built with ❤️ to help communities save money together through Ahjoor Savings

