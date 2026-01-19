# Project Flowchart & Architecture

This document maps out the flow of the Attendance and Leave System based on the current backend architecture. You can view these diagrams in VS Code (using the Mermaid extension) or copy the code into the [Mermaid Live Editor](https://mermaid.live/).

## 1. High-Level Architecture

This diagram shows how the main components of the system interact.

```mermaid
graph TD
    Client["Frontend Client / User"]
    
    subgraph Backend ["Backend Server (Express.js)"]
        Server["Server Entry Point (server.js)"]
        Auth["Auth Middleware"]
        
        subgraph Routes ["API Routes"]
            AuthRoutes[/"/auth"/]
            AttRoutes[/"/attendance"/]
            LeaveRoutes[/"/leave"/]
        end
        
        subgraph Controllers ["Logic & Models"]
            UserModel["User Model"]
            AttModel["Attendance Model"]
            LeaveModel["Leave Model"]
        end
    end
    
    Database[("MongoDB Database")]

    %% Connections
    Client -->|"HTTP Requests"| Server
    Server --> AuthRoutes
    Server --> AttRoutes
    Server --> LeaveRoutes
    
    AuthRoutes --> UserModel
    AttRoutes -->|"Protected"| Auth
    LeaveRoutes -->|"Protected"| Auth
    
    Auth --> AttModel
    Auth --> LeaveModel
    
    UserModel --> Database
    AttModel --> Database
    LeaveModel --> Database
```

## 2. User Authentication Flow

This flow details the Signup and Login process.

```mermaid
sequenceDiagram
    actor User
    participant API as Backend API
    participant DB as Database

    %% Signup
    User->>API: POST /auth/signup (name, email, password, role)
    API->>DB: Check if email exists
    alt Email Exists
        DB-->>API: User found
        API-->>User: 409 Conflict
    else Email Unique
        API->>DB: Create User (Hash Password)
        DB-->>API: User Created
        API->>API: Generate JWT Token
        API-->>User: 201 Created (Set-Cookie: token)
    end

    %% Login
    User->>API: POST /auth/login (email, password)
    API->>DB: Find User by Email
    alt User Found
        DB-->>API: User Data
        API->>API: Compare Passwords (bcrypt)
        alt Password Match
            API->>API: Generate JWT Token
            API-->>User: 200 OK (Set-Cookie: token)
        else Invalid Password
            API-->>User: 401 Unauthorized
        end
    else User Not Found
        API-->>User: 401 Unauthorized
    end
```

## 3. Student Workflow

This flowchart shows the actions available to a user with the **Student** role.

```mermaid
graph TD
    Start((Start)) --> Login["Login as Student"]
    Login --> Dashboard{"Student Dashboard"}
    
    %% Mark Attendance
    Dashboard -->|"Mark Attendance"| PostAtt[/"POST /attendance/"/]
    PostAtt --> Auth{"Auth & Role Check"}
    Auth -- "Valid/Student" --> CheckDate{"Attendance Marked Today?"}
    CheckDate -- No --> CreateAtt["Create Attendance Record"]
    CreateAtt --> SuccessAtt["Return Success"]
    CheckDate -- Yes --> ErrorAtt["Return Error: Already Marked"]
    
    %% View Attendance
    Dashboard -->|"View History"| GetAtt[/"GET /attendance/"/]
    GetAtt --> FetchAtt["Fetch User's Attendance"]
    FetchAtt --> ShowAtt["Display History"]

    %% Request Leave
    Dashboard -->|"Request Leave"| PostLeave[/"POST /leave/"/]
    PostLeave --> ValidateLeave{"Reason Provided?"}
    ValidateLeave -- Yes --> CreateLeave["Create Leave (Pending)"]
    CreateLeave --> SuccessLeave["Return Success"]
    
    %% View Leave
    Dashboard -->|"View My Leaves"| GetLeave[/"GET /leave/"/]
    GetLeave --> FetchLeave["Fetch User's Leaves"]
    FetchLeave --> ShowLeave["Display Leave Status"]

```

## 4. Admin Workflow

This flowchart shows the actions available to a user with the **Admin** role.

```mermaid
graph TD
    Start((Start)) --> Login["Login as Admin"]
    Login --> Dashboard{"Admin Dashboard"}
    
    %% View All Attendance
    Dashboard -->|"View All Attendance"| GetAllAtt[/"GET /attendance/all/"/]
    GetAllAtt --> Auth{"Auth & Role Check"}
    Auth -- "Valid/Admin" --> FetchAllAtt["Fetch All Records + Populate User Info"]
    FetchAllAtt --> SortAtt["Sort by Date"]
    SortAtt --> DisplayAtt["Show Implementation List"]

    %% View All Leaves
    Dashboard -->|"View All Leaves"| GetAllLeave[/"GET /leave/all/"/]
    GetAllLeave --> FetchAllLeave["Fetch All Leaves + Populate User Info"]
    FetchAllLeave --> DisplayLeave["Show Leave Requests"]
    
    %% Manage Leave
    DisplayLeave -->|"Select Request"| UpdateLeave[/"PATCH /leave/:id/"/]
    UpdateLeave --> Action{"Action?"}
    Action -- Approve --> SetStatusA["Set Status: Approved"]
    Action -- Reject --> SetStatusR["Set Status: Rejected"]
    SetStatusA --> UpdateDB["Update Database"]
    SetStatusR --> UpdateDB
    UpdateDB --> Result["Return Updated Leave"]
```
