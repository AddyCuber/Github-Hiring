const sponsorsQuery = `
query GetSponsorsData {
  viewer {
    id
    databaseId
    login
    name
    avatarUrl
    bio
    url
    sponsorshipsAsMaintainer(first: 100, includePrivate: false) {
      totalCount
    }
    lifetimeReceivedSponsorshipValues {
      nodes {
        value
      }
    }
    monthlyEstimatedSponsorsIncomeInCents
  }
}
`

type GitHubViewer = {
  id: string
  databaseId: number | null
  login: string
  name: string | null
  avatarUrl: string
  bio: string | null
  url: string
  sponsorshipsAsMaintainer: { totalCount: number }
  lifetimeReceivedSponsorshipValues: { nodes: Array<{ value: number }> }
  monthlyEstimatedSponsorsIncomeInCents: number
}

export type SponsorsSnapshot = {
  githubId: number
  username: string
  name: string | null
  avatarUrl: string
  bio: string | null
  githubUrl: string
  totalEarningsUsd: number
  monthlyRecurringUsd: number
  sponsorCount: number
}

export async function fetchSponsorsSnapshot(accessToken: string): Promise<SponsorsSnapshot> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: sponsorsQuery })
  })

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed with ${response.status}`)
  }

  const body = (await response.json()) as {
    data?: { viewer?: GitHubViewer }
    errors?: Array<{ message: string }>
  }

  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "))
  }

  const viewer = body.data?.viewer
  if (!viewer || !viewer.databaseId) {
    throw new Error("Could not resolve GitHub user identity from GraphQL response")
  }

  const totalCents = viewer.lifetimeReceivedSponsorshipValues.nodes.reduce(
    (sum, node) => sum + (node.value || 0),
    0
  )

  return {
    githubId: viewer.databaseId,
    username: viewer.login,
    name: viewer.name,
    avatarUrl: viewer.avatarUrl,
    bio: viewer.bio,
    githubUrl: viewer.url,
    totalEarningsUsd: Math.floor(totalCents / 100),
    monthlyRecurringUsd: Math.floor(viewer.monthlyEstimatedSponsorsIncomeInCents / 100),
    sponsorCount: viewer.sponsorshipsAsMaintainer.totalCount
  }
}
