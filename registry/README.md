# MCP Registry listing

`server.json` lists Clivly's remote MCP server in the [official MCP Registry](https://registry.modelcontextprotocol.io) as `com.clivly/crm`. Clients sign in with OAuth, so the listing carries no headers or keys.

The `com.clivly/` namespace is proven by owning clivly.com, once, with a key pair you keep. Never commit the private key.

```bash
brew install openssl@3 mcp-publisher
```

```bash
/opt/homebrew/opt/openssl@3/bin/openssl genpkey -algorithm Ed25519 -out ~/.clivly-mcp-registry-key.pem
```

```bash
/opt/homebrew/opt/openssl@3/bin/openssl pkey -in ~/.clivly-mcp-registry-key.pem -pubout -outform DER | tail -c 32 | base64
```

Add a TXT record on the apex `clivly.com` (not a subdomain), with the printed public key:

```text
v=MCPv1; k=ed25519; p=<PUBLIC_KEY>
```

Once the record has propagated, log in with the private key's hex and publish from this folder:

```bash
mcp-publisher login dns --domain clivly.com --private-key "$(/opt/homebrew/opt/openssl@3/bin/openssl pkey -in ~/.clivly-mcp-registry-key.pem -noout -text | grep -A3 'priv:' | tail -n +2 | tr -d ' :\n')"
```

```bash
cd registry && mcp-publisher publish
```

Bump `version` here with each plugin release. Republishing the same version is refused.
