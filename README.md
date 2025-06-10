# Devflow

## Developer Q&A Platform

> Originally created by [JSMastery](https://jsmastery.com/) Replicated by [zyadfallatah](https://zyadfallatah.com/)

### What is Devflow?

Devflow is a Q&A platform that allows you to ask questions and get answers from other developers. It is a community-driven platform where developers can ask questions and get answers from each other.

### Technologies

| Technology                               | Description                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| [Next.js](https://nextjs.org/)           | A React framework for server-side rendering and static site generation |
| [React](https://reactjs.org/)            | A JavaScript library for building user interfaces                      |
| [Tailwind CSS](https://tailwindcss.com/) | A utility-first CSS framework for rapidly building custom designs      |
| [MongoDB](https://www.mongodb.com/)      | A document database                                                    |
| [shadcn/ui](https://shadcn.com/ui/)      | A collection of accessible, composable, pre-styled components          |

### External apis

| API                                                                                                   | Description           |
| ----------------------------------------------------------------------------------------------------- | --------------------- |
| [Github oauth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps) | Github authentication |
| [google oauth](https://developers.google.com/identity/protocols/oauth2)                               | Google authentication |
| [imagekit](https://imagekit.io/docs)                                                                  | Images upload         |
| [OpenAI](https://openai.com/api/)                                                                     | Generate Answer LLM   |
| [Jsearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)                                     | Jobs search           |

### Installation

**Prerequisites**

- Node.js 20.x
- Active MongoDB database
- Active Github OAuth App
- Active Google OAuth App
- Active Imagekit api account

**Environment variables**

```
AUTH_SECRET=your auth secret (npx auth secret)
AUTH_GITHUB_ID=your github oauth id
AUTH_GITHUB_SECRET=your github oauth secret
AUTH_GOOGLE_ID=your google oauth id
AUTH_GOOGLE_SECRET=your google oauth secret
MONGODB_URI=your mongodb uri
OPENAI_API_KEY=your openai api key (optional)
RAPID_API_JOB_KEY=your rapid api job key (optional)
IMAGEKIT_PUBLIC_KEY=your imagekit public key
IMAGEKIT_PRIVATE_KEY=your imagekit private key
```

after that, run the following commands:

```bash
git clone https://github.com/zyadfallatah/devflow.git Or your forked repo
cd devflow
npm install --legacy-peer-deps or --force
npm run dev
```
