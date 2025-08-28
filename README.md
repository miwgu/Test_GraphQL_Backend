# Book Management_GraphQL API & REST API_Backend

## Comparison Between GraphQL and REST: Implementation and Observations

| No. | Aspect | GraphQL | REST |
|-----|--------|---------|------|
| 1 | Client-side Data Control | The client can request only the fields it needs, reducing over-fetching. Example: request only `thumbnailUrl` when needed. | The response is static — over-fetching is more likely. Images may always be included in the response. |
| 2 | Access Control & Sensitive Data | Poor schema or permission design can lead to accidental exposure of sensitive data, e.g., `sensitiveNotes`. | Only specific endpoints like `GET /rest/book/admin/all` are created for sensitive data → lower risk. |
| 3 | Error Handling | Returns detailed error messages that may reveal internal information. | Simpler error messages; lower risk of exposing server information. |
| 4 | Caching & Performance | Flexible queries make HTTP caching harder. Requires client-side caching (e.g., Apollo). | HTTP caching (e.g., Cache-Control) works well; easier to cache static resources. |

### Observations
- GraphQL is great for flexible data fetching but requires careful caching and permission handling.  
- REST is more straightforward and easier to cache, but may lead to over-fetching.  

