import Globals from './helpers/globals';
import { addBigfootSighting, expectMatchesSighting, Bigfoot, createSchema,
  A_BIGFOOT_SIGHTING, A_REDIS_ID, A_REDIS_KEY,
  ANOTHER_BIGFOOT_SIGHTING, ANOTHER_REDIS_ID, ANOTHER_REDIS_KEY,
  A_THIRD_BIGFOOT_SIGHTING, A_THIRD_REDIS_ID, A_THIRD_REDIS_KEY } from './helpers/bigfoot-data-helper';
  
import Client from '../lib/client';
import { Schema } from '../lib/schema'
import Repository from '../lib/repository';

const globals: Globals = (globalThis as unknown) as Globals;

describe("Repository", () => {

  let client: Client;
  let repository: Repository<Bigfoot>;
  let schema: Schema<Bigfoot>;
  let entities: Bigfoot[];

  beforeAll(() => {
    client = globals.client;
    schema = createSchema();
  });

  beforeEach(async () => {
    repository = client.fetchRepository<Bigfoot>(schema);
    await repository.createIndex();
  });

  describe("#find", () => {
    beforeEach(async () => {
      await addBigfootSighting(client, A_REDIS_KEY, A_BIGFOOT_SIGHTING);
      await addBigfootSighting(client, ANOTHER_REDIS_KEY, ANOTHER_BIGFOOT_SIGHTING);
      await addBigfootSighting(client, A_THIRD_REDIS_KEY, A_THIRD_BIGFOOT_SIGHTING);
    });

    describe("finding all the things", () => {
      beforeEach(async () => {
        entities = await repository.search().run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities", () => {
        expect(entities).toHaveLength(3);
        expectMatchesSighting(entities[0], A_REDIS_ID, A_BIGFOOT_SIGHTING);
        expectMatchesSighting(entities[1], ANOTHER_REDIS_ID, ANOTHER_BIGFOOT_SIGHTING);
        expectMatchesSighting(entities[2], A_THIRD_REDIS_ID, A_THIRD_BIGFOOT_SIGHTING);
      });
    });
    
    describe("finding a matching a string", () => {
      beforeEach(async () => {
        entities = await repository.search()
          .where('state').is('OH')
          .run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities that match the string", () => {
        expect(entities).toHaveLength(2);
        expectMatchesSighting(entities[0], A_REDIS_ID, A_BIGFOOT_SIGHTING);
        expectMatchesSighting(entities[1], ANOTHER_REDIS_ID, ANOTHER_BIGFOOT_SIGHTING);
      });
    });

    describe("finding multiple matching strings", () => {
      beforeEach(async () => {
        entities = await repository.search()
          .where('county').is('Ashland')
          .where('state').is('OH')
          .run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities matching both strings", () => {
        expect(entities).toHaveLength(1);
        expectMatchesSighting(entities[0], ANOTHER_REDIS_ID, ANOTHER_BIGFOOT_SIGHTING);
      });
    });

    describe("finding a boolean true", () => {
      beforeEach(async () => {
        entities = await repository.search()
          .where('eyewitness').isTrue()
          .run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities matching a boolean true", () => {
        expect(entities).toHaveLength(2);
        expectMatchesSighting(entities[0], A_REDIS_ID, A_BIGFOOT_SIGHTING);
        expectMatchesSighting(entities[1], A_THIRD_REDIS_ID, A_THIRD_BIGFOOT_SIGHTING);
      });
    });

    describe("finding a boolean false", () => {
      beforeEach(async () => {
        entities = await repository.search()
          .where('eyewitness').isFalse()
          .run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities matching a boolean false", () => {
        expect(entities).toHaveLength(1);
        expectMatchesSighting(entities[0], ANOTHER_REDIS_ID, ANOTHER_BIGFOOT_SIGHTING);
      });
    });

    describe("finding a number that equals a number", () => {
      beforeEach(async () => {
        entities = await repository.search()
          .where('temperature').equals(75)
          .run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities matching that number", () => {
        expect(entities).toHaveLength(1);
        expectMatchesSighting(entities[0], A_REDIS_ID, A_BIGFOOT_SIGHTING);
      });
    });

    describe("finding a number that is greater than a number", () => {
      beforeEach(async () => {
        entities = await repository.search()
          .where('temperature').greaterThan(87)
          .run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities greater than that number", () => {
        expect(entities).toHaveLength(1);
        expectMatchesSighting(entities[0], A_THIRD_REDIS_ID, A_THIRD_BIGFOOT_SIGHTING);
      });
    });

    describe("finding a number that is greater than or equal to a number", () => {
      beforeEach(async () => {
        entities = await repository.search()
          .where('temperature').greaterThanEqual(87)
          .run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities greater than that number", () => {
        expect(entities).toHaveLength(2);
        expectMatchesSighting(entities[0], ANOTHER_REDIS_ID, ANOTHER_BIGFOOT_SIGHTING);
        expectMatchesSighting(entities[1], A_THIRD_REDIS_ID, A_THIRD_BIGFOOT_SIGHTING);
      });
    });


    describe("finding a number that is less than a number", () => {
      beforeEach(async () => {
        entities = await repository.search()
          .where('temperature').lessThan(87)
          .run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities greater than that number", () => {
        expect(entities).toHaveLength(1);
        expectMatchesSighting(entities[0], A_REDIS_ID, A_BIGFOOT_SIGHTING);
      });
    });

    describe("finding a number that is less than or equal to a number", () => {
      beforeEach(async () => {
        entities = await repository.search()
          .where('temperature').lessThanEqual(87)
          .run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities greater than that number", () => {
        expect(entities).toHaveLength(2);
        expectMatchesSighting(entities[0], A_REDIS_ID, A_BIGFOOT_SIGHTING);
        expectMatchesSighting(entities[1], ANOTHER_REDIS_ID, ANOTHER_BIGFOOT_SIGHTING);
      });
    });

    describe("finding a number that is in a range to a pair of numbers", () => {
      beforeEach(async () => {
        entities = await repository.search()
          .where('temperature').inRange(75, 87)
          .run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities in range", () => {
        expect(entities).toHaveLength(2);
        expectMatchesSighting(entities[0], A_REDIS_ID, A_BIGFOOT_SIGHTING);
        expectMatchesSighting(entities[1], ANOTHER_REDIS_ID, ANOTHER_BIGFOOT_SIGHTING);
      });
    });

    describe("finding a number that is in a range exclusive to a pair of numbers", () => {
      beforeEach(async () => {
        entities = await repository.search()
          .where('temperature').inRangeExclusive(75, 93)
          .run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities in range", () => {
        expect(entities).toHaveLength(1);
        expectMatchesSighting(entities[0], ANOTHER_REDIS_ID, ANOTHER_BIGFOOT_SIGHTING);
      });
    });

    describe("finding entity matching a boolean, a string, and a number", () => {
      beforeEach(async () => {
        entities = await repository.search()
          .where('eyewitness').isTrue()
          .where('county').is('Ashland')
          .where('temperature').greaterThanEqual(65)
          .run();
        entities.sort(sortByRedisId);
      });

      it("returns all the entities", () => {
        expect(entities).toHaveLength(1);
        expectMatchesSighting(entities[0], A_THIRD_REDIS_ID, A_THIRD_BIGFOOT_SIGHTING);
      });
    });
  });
});

function sortByRedisId(a: Bigfoot, b: Bigfoot): number {
  if (a.redisId < b.redisId) return -1
  if (a.redisId > b.redisId) return 1;
  return 0;
}
