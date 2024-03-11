  import {
  Canister,
  Err,
  Ok,
  Record,
  Result,
  Some,
  StableBTreeMap,
  Variant,
  Vec,
  query,
  text,
  update,
} from "azle";

import { v4 as uuid } from "uuid";

const Person = Record({
  id: text,
  name: text,
});

const Error = Variant({
  notFound: text,
  doesNotExist: text,
  unexpectedError: text,
  serverError: text,
});

const PersonPayload = Record({
  name: text,
});

type personType = typeof Person.tsType;
type personPayloadType = typeof PersonPayload.tsType;

const PersonStorage = StableBTreeMap<text, personType>(0);

export default Canister({
  addPerson: update([PersonPayload], Person, (payload: personPayloadType) => {
    const person: personType = {
      id: uuid(),
      ...payload,
    };
    PersonStorage.insert(person.id, person);
    return person;
  }),
  getPerson: query([text], Result(Person, Error), (id: text) => {
    const personOpt = PersonStorage.get(id);
    if ("None" in personOpt) {
      return Err({ doesNotExist: `A person with id ${id} does not exist` });
    }
    return Ok(personOpt.Some);
  }),
  getPersons: query([], Vec(Person), () => {
    return PersonStorage.values();
  }),
  updatePerson: update(
    [text, PersonPayload],
    Result(Person, Error),
    (id, payload: personPayloadType) => {
      try {
        const personOpt = PersonStorage.get(id);
        if ("None" in personOpt) {
          return Err({ doesNotExist: `A person with id ${id} does not exist` });
        }
        const cleanedPayload = Object.fromEntries(
          Object.entries(payload).filter(([_, value]) => value !== "")
        );
        const person: personType = {
          ...personOpt.Some,
          ...cleanedPayload,
        };
        PersonStorage.insert(personOpt.Some.id, person);
        return Ok(person);
      } catch (error) {
        return Err({ unexpectedError: "An unexpected error occured" });
      }
    }
  ),
  deletePerson: update([text], Result(Person, Error), (id: text) => {
    try {
      const personOpt = PersonStorage.remove(id);
      if ("None" in personOpt) {
        return Err({ doesNotExist: `A person with id ${id} does not exist` });
      }
      return Ok(personOpt.Some);
    } catch (error) {
      return Err({ unexpectedError: "An unexpected error occured" });
    }
  }),
});
