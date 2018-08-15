import { AsyncTest, Expect, Test, TestCase, TestFixture, Timeout, TeardownFixture, Teardown, AsyncTeardown, AsyncTeardownFixture, FocusTest } from 'alsatian';

import * as Data from './data';
import { User } from '../server/controllers/user';



const enum Mutations {
    UID,
    COMPANY,
    ID,
    FILE_ID,
    CASE_ID
}

function mutate(source, mutation?: Mutations) {
    const obj = JSON.parse(JSON.stringify(source));
    switch (mutation) {
        case Mutations.UID:
            delete obj.uid;
            break;
        case Mutations.COMPANY:
            delete obj._company_id;
            delete obj.company_id;
            break;
        case Mutations.ID:
            obj.id = guid();
            break;
        case Mutations.FILE_ID:
            obj.file_id = guid();
            break;
        case Mutations.CASE_ID:
            obj.case_id = guid();
            break;
    }
    return obj;
}

function guid() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

@TestFixture('Test Message tile')
export class TestsOfUser {

    @AsyncTest('register')
    @TestCase(Data.newUser)
    @Timeout(10000)
    public async registerFail(userMutation) {
        const controller = new User();
        const result = await controller.register(userMutation)

        //const alteredUser = mutate(await getUser(LEVEL.INTERNAL), userMutation);
        Expect(result).toBeDefined();
    }
    @AsyncTest('register good')
    @TestCase(Data.newUserNew)
    @Timeout(10000)
    public async register(userMutation) {
        const controller = new User();
        const result = await controller.register(userMutation)

        //const alteredUser = mutate(await getUser(LEVEL.INTERNAL), userMutation);
        Expect(result).toBeDefined();
    }

    // @AsyncTest('Error test')
    // @TestCase({ data: null, att: att } as MessageWithContext, MessageNames.Case, LEVEL.INTERNAL)
    // @Timeout(10000)
    // public async ErrorTest(messageEvent, messageName, userLevel) {
    //     messageEvent = mutate(messageEvent);
    //     messageEvent.att = mutate(await getUser(userLevel));
    //     const resultConfirmationResult = await MessageHelper.createFromMessage(messageEvent, messageName);
    //     Expect(resultConfirmationResult).toBe(LEVEL.INTERNAL);
    // }


    // @AsyncTest('CaseMessages')
    // @TestCase({ data: Data.NewCaseMessage, att: att } as MessageWithContext, MessageNames.Case, LEVEL.INTERNAL)//error
    // @TestCase({ data: Data.NewCaseMessage, att: att } as MessageWithContext, MessageNames.Case, LEVEL.EXTERNAL)
    // @TestCase({ data: Data.NewCaseMessage, att: att } as MessageWithContext, MessageNames.Case, LEVEL.INTERNAL)
    // @TestCase({ data: mutate(Data.NewCaseMessage, Mutations.CASE_ID), att: att } as MessageWithContext, MessageNames.Case, LEVEL.INTERNAL)
    // @Timeout(10000)
    // public async CaseMessages(messageEvent, messageName, userLevel) {
    //     messageEvent = mutate(messageEvent);
    //     messageEvent.att = mutate(await getUser(userLevel));
    //     const resultConfirmationResult = await MessageHelper.createFromMessage(messageEvent, messageName);
    //     if (userLevel === LEVEL.INTERNAL) {
    //         Expect(resultConfirmationResult).toBe(LEVEL.INTERNAL);
    //     }
    //     else {
    //         Expect(resultConfirmationResult).toBeDefined();
    //     }
    // }

    // @AsyncTest('CommentMessages')
    // @TestCase({ data: Data.CommentMessage, att: att } as MessageWithContext, MessageNames.Comment, LEVEL.INTERNAL) //internal send to external
    // @TestCase({ data: Data.CommentMessage, att: att } as MessageWithContext, MessageNames.Comment, LEVEL.EXTERNAL) //external approves internal
    // @TestCase({ data: Data.CommentMessage2, att: att } as MessageWithContext, MessageNames.Comment, LEVEL.EXTERNAL)//external send to internal 
    // @TestCase({ data: Data.CommentMessage2, att: att } as MessageWithContext, MessageNames.Comment, LEVEL.INTERNAL)//internal approves external
    // @TestCase({ data: Data.CommentPrivateMessage, att: att } as MessageWithContext, MessageNames.Comment, LEVEL.INTERNAL)
    // @TestCase({ data: Data.CommentPrivateMessage, att: att } as MessageWithContext, MessageNames.Comment, LEVEL.INTERNAL)
    // @Timeout(10000)
    // public async CommentMessages(messageEvent, messageName, userLevel) {
    //     messageEvent = mutate(messageEvent);
    //     messageEvent.att = mutate(await getUser(userLevel));

    //     const resultConfirmationResult = await MessageHelper.createFromMessage(messageEvent, messageName);
    //     Expect(resultConfirmationResult).toBeDefined();
    // }


    // @AsyncTest('RawlogMessages')
    // @TestCase({ data: mutate(Data.RawLogMessage, Mutations.FILE_ID), att: att } as MessageWithContext, MessageNames.Rawlog, LEVEL.EXTERNAL)
    // @TestCase({ data: mutate(Data.RawLogMessage, Mutations.FILE_ID), att: att } as MessageWithContext, MessageNames.Rawlog, LEVEL.INTERNAL)
    // @TestCase({ data: mutate(Data.RawLogHotStorageMessage, Mutations.ID), att: att } as MessageWithContext, MessageNames.Rawlog, LEVEL.EXTERNAL)
    // @TestCase({ data: mutate(Data.RawLogHotStorageMessage, Mutations.ID), att: att } as MessageWithContext, MessageNames.Rawlog, LEVEL.INTERNAL)
    // @TestCase({ data: mutate(mutate(Data.RawLogHotStorageMessage, Mutations.COMPANY), Mutations.FILE_ID), att: att } as MessageWithContext, MessageNames.Rawlog, LEVEL.EXTERNAL)
    // @Timeout(10000)
    // public async RawlogMessages(messageEvent, messageName, userLevel) {
    //     messageEvent = mutate(messageEvent);
    //     messageEvent.att = mutate(await getUser(userLevel));

    //     try {
    //         const result = await MessageHelper.createFromMessage(messageEvent, messageName);
    //         Expect(result).toBeDefined();

    //         const resultConfirmationResult = await MessageHelper.createFromMessage(messageEvent, messageName);
    //         Expect(resultConfirmationResult).toBeDefined();
    //     } catch (error) {
    //         Expect(error.message).toBe('company undefined not found');
    //     }
    // }



    @AsyncTeardownFixture
    public async CleanUp() {
        // const db = await DBHandler.getConnection('default');
        // const result = await db.collection('Message').remove({ 'TEST': true });
        // Expect(result).toBeDefined();
    }

}





