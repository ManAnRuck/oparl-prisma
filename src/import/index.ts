import { Oparl } from 'oparl-sdk';
import { Organization } from 'oparl-sdk/dist/types';
import {
  PrismaClient,
  OrganizationCreateInput,
  OrganizationUpdateInput,
  OrganizationCreateOneWithoutOrganizationsInput,
} from '@prisma/client';

const oparl = new Oparl({
  entrypoint:
    'https://sdnetrim.kdvz-frechen.de/rim4883/webservice/oparl/v1.1/body/1',
  limit: {
    maxRequests: 5,
    perMilliseconds: 1000,
  },
});

const prepareSubOrganizationOf = (
  subOrganizationOf?: Organization,
): OrganizationCreateOneWithoutOrganizationsInput | null | undefined => {
  if (!subOrganizationOf) {
    return {
      connect: undefined,
      create: undefined,
    };
  }
  return {
    connect: subOrganizationOf,
    create: subOrganizationOf
      ? {
          ...subOrganizationOf,
          post: {
            set: subOrganizationOf.post ? subOrganizationOf.post : [],
          },
          keyword: {
            set: subOrganizationOf.keyword ? subOrganizationOf.keyword : [],
          },
          subOrganizationOf: prepareSubOrganizationOf(
            subOrganizationOf.subOrganizationOf,
          ),
        }
      : undefined,
  };
};

export const startImport = async () => {
  const prisma = new PrismaClient();
  let organizationList = await oparl.getOrganizations();
  if (organizationList) {
    let hasNext = true;
    do {
      const organizations = organizationList.data.map(async organization => {
        const {
          id,
          type,
          classification,
          created,
          deleted,
          endDate,
          keyword,
          license,
          modified,
          name,
          organizationType,
          post,
          shortName,
          startDate,
          subOrganizationOf,
          web,
          website,
        } = organization;
        // console.log('import orga');
        const organizationPrepared:
          | OrganizationCreateInput
          | OrganizationCreateInput = {
          id,
          type,
          classification,
          created,
          deleted,
          endDate,
          keyword: { set: keyword ? keyword : [] },
          license,
          modified,
          name,
          organizationType,
          post: { set: post ? post : [] },
          shortName,
          startDate,
          subOrganizationOf: prepareSubOrganizationOf(subOrganizationOf),
          web,
          website,
        };
        return prisma.organization.upsert({
          create: organizationPrepared,
          update: organizationPrepared,
          where: { id: organizationPrepared.id },
        });
      });
      await Promise.all(organizations);
      if (organizationList?.next) {
        organizationList = await organizationList.next();
      } else {
        hasNext = false;
      }
    } while (hasNext);
    console.log('### IMPORT DONE ###');
  }
};
