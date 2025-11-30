# Test Structure

This directory contains all test files for the API server.

## Directory Structure

```
test/
├── unit/              # Unit tests (isolated component tests)
│   └── users/        # User-related unit tests
│       ├── users.service.spec.ts
│       └── users.controller.spec.ts
└── e2e/              # End-to-end tests (integration tests)
    └── users.e2e-spec.ts
```

## Test Types

### Unit Tests (`test/unit/`)
- Test individual components in isolation
- Use mocks for dependencies
- Fast execution
- Example: `users.service.spec.ts`, `users.controller.spec.ts`

### E2E Tests (`test/e2e/`)
- Test complete request/response cycles
- Use real HTTP requests via `supertest`
- Test the full application stack
- Example: `users.e2e-spec.ts`

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run only unit tests
npm run test -- test/unit

# Run only e2e tests
npm run test -- test/e2e
```

## Writing Tests

### Unit Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../../src/users/users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .expect(200);
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Naming**: Use descriptive test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mocks**: Mock external dependencies in unit tests
5. **Coverage**: Aim for high code coverage (>80%)

