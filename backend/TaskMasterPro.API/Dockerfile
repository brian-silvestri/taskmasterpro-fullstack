# -------- BUILD --------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiamos TODO el backend
COPY ../backend/ ./

# Restauramos
RUN dotnet restore TaskMasterPro.API/TaskMasterPro.API.csproj

# Build + Publish
RUN dotnet publish TaskMasterPro.API/TaskMasterPro.API.csproj -c Release -o /app/publish

# -------- RUNTIME --------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "TaskMasterPro.API.dll"]
