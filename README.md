# dagger-vercel
A dagger extension for Vercel deployment

## Supported Commands
- subdir: **String** (ex: ".")
- siteName: **String** (ex: "my-website")
- token: **SecretId**
- build: **String** (ex: "build/")
- teamId: **String** (ex: "team_NHY3EF5Z6987pl2K1YiGtcg")

## Example
```gql
query deploy(
  $tokenSecret: SecretID!
){
  netlifyDeploy(
      subdir: "."
      siteName: $siteName
      token: $tokenSecret
      build: "out/"
      teamId: "team_NHY3EF5Z6987pl2K1YiGtcg"

  ) {
      deployURL
  }
}
```
