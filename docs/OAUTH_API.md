OAuth 2.0 / OpenID Connect Server API Documentation
1. Authorization Endpoint
GET /oauth/authorize

Description:
Starts OAuth authorization code flow. User authenticates and consents.

Query Parameters:

Parameter	Required	Description
response_type	Yes	Must be code
client_id	Yes	Client application's identifier
redirect_uri	Yes	One of the client’s registered redirect URIs
scope	Optional	Space-separated list of scopes (e.g., openid profile email)
state	Recommended	Opaque value to maintain state between request and callback
code_challenge	Recommended for PKCE	PKCE code challenge, base64url-encoded SHA256 hash or plain string
code_challenge_method	Recommended for PKCE	Either S256 or plain, default is plain if omitted

Response:
Renders consent page for user to approve scopes.

2. Authorization Decision Endpoint
POST /oauth/authorize

Description:
User submits approval or denial of requested scopes.

Body Parameters (form-urlencoded):

Parameter	Description
approve	'yes' to approve, empty or absent to deny
client_id	Client identifier
redirect_uri	Redirect URI to send user back
scope	Requested scopes
state	State passed from authorize request
code_challenge	PKCE code challenge (hidden input)
code_challenge_method	PKCE code challenge method (hidden input)

Response:

If approved: Redirects to redirect_uri?code=AUTH_CODE&state=STATE

If denied: Redirects to redirect_uri?error=access_denied&state=STATE

3. Token Endpoint
POST /oauth/token

Description:
Exchanges authorization code or refresh token for access tokens.

Headers:

Content-Type: application/x-www-form-urlencoded

Body Parameters:

Parameter	Required	Description
grant_type	Yes	authorization_code or refresh_token
code	Required if authorization_code grant	Authorization code received from /authorize
redirect_uri	Required if authorization_code grant	Redirect URI used in authorization step
client_id	Yes	Client identifier
client_secret	Yes	Client secret
code_verifier	Required if PKCE was used	Original PKCE code verifier string
refresh_token	Required if refresh_token grant	Refresh token to get new access token

Response (JSON):

json
Copy
Edit
{
  "access_token": "string",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "string",
  "scope": "openid profile email",
  "id_token": "jwt (optional, if scope includes openid)"
}
4. UserInfo Endpoint
GET /oauth/userinfo

Description:
Returns user profile claims based on scopes.

Headers:

Authorization: Bearer ACCESS_TOKEN

Response (JSON):

Depending on scopes:

json
Copy
Edit
{
  "name": "Jane Doe",
  "family_name": "Doe",
  "given_name": "Jane",
  "birthdate": "1990-01-01",
  "gender": "female",
  "email": "jane@example.com"
}
5. Client Registration Endpoint
POST /oauth/register-client

Description:
Registers a new OAuth client application.

Body Parameters (JSON):

Parameter	Required	Description
name	Yes	Client application name
redirectUris	Yes	Array or single string of URIs
scopes	Optional	Array or single string of scopes

Response (JSON):

json
Copy
Edit
{
  "client_id": "generated_id",
  "client_secret": "generated_secret",
  "redirect_uris": ["..."],
  "scopes": ["..."]
}
6. Token Revocation Endpoint
POST /oauth/revoke

Description:
Revokes access or refresh tokens.

Headers:

Authorization: Basic BASE64(client_id:client_secret)

Body Parameters (form-urlencoded):

Parameter	Required	Description
token	Yes	Token string to revoke
token_type_hint	Optional	access_token or refresh_token

Response:

Status 200 OK, no content.

7. PKCE Details
If code_challenge is sent in /authorize, then client must send code_verifier in /token.

code_challenge_method is usually S256.

Server validates code_verifier matches code_challenge per PKCE spec.

Environment Variables
Variable	Description
MONGO_URI	MongoDB connection string
JWT_SECRET	Secret for signing JWT tokens
OAUTH_ISSUER	Issuer URL (e.g., http://localhost:3000)

Testing Tips
Use a client like Postman or OAuth tools to simulate flows.

For PKCE, generate code_verifier and derive code_challenge as base64url(SHA256(code_verifier)).

Always include state to prevent CSRF.

Validate id_token JWTs with your JWT_SECRET.

Example curl (Authorization Code + PKCE)
bash
Copy
Edit
# 1. Generate code_challenge
CODE_VERIFIER="randomstring"
CODE_CHALLENGE=$(echo -n $CODE_VERIFIER | openssl dgst -sha256 -binary | base64 | tr '+/' '-_' | tr -d '=')

# 2. Authorization URL
echo "http://localhost:3000/oauth/authorize?response_type=code&client_id=abc123&redirect_uri=http://localhost:5000/callback&scope=openid%20profile&state=xyz&code_challenge=$CODE_CHALLENGE&code_challenge_method=S256"

# 3. Exchange code for tokens
curl -X POST http://localhost:3000/oauth/token \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE_FROM_PREVIOUS_STEP" \
  -d "redirect_uri=http://localhost:5000/callback" \
  -d "client_id=abc123" \
  -d "client_secret=secret456" \
  -d "code_verifier=$CODE_VERIFIER"
If you want, I can generate a detailed Postman collection or help with client implementation examples!

Just say the word.