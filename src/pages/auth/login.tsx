import {
  ActionIcon,
  Affix,
  Badge,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Transition,
  useMantineColorScheme
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {showNotification} from '@mantine/notifications';
import Container from 'components/Container';
import useSession from 'lib/hooks/useSession';
import router from 'next/router';
import {useEffect, useState} from 'react';
import {FiLock, FiLogIn, FiUser} from 'react-icons/fi';
import {RiCheckFill, RiErrorWarningFill, RiMoonClearFill, RiSunFill} from 'react-icons/ri';
import {SiDiscord} from 'react-icons/si';

export default function LoginPage() {
  const [mount, setMount] = useState(false);
  const [busy, setBusy] = useState(false);
  const { mutate } = useSession();
  const loginWithDiscord = () => {
    fetch('/api/discord/auth').then(r => r.json()).then(r => {
      router.push(r.url);
    });
  };
  useEffect(() => {
    setMount(true);
    return () => setMount(false);
  }, []);
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      rememberMe: true
    }
  });
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <Paper style={{ height: '100vh' }}>
      <Transition transition='slide-right' duration={600} mounted={mount}>
        {styles => (
          <Container style={{ backgroundSize: 'cover', ...styles }}>
            <Group align='center' spacing='lg' position='apart'>
              <form style={{ minWidth: 360 }} onSubmit={form.onSubmit(values => {
                setBusy(true);
                fetch('/api/auth/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(values)
                }).then(r => r.json()).then(r => {
                  if (r.success) {
                    showNotification({ title: 'Logged in successfully, redirecting to the Dashboard.', message: '', icon: <RiCheckFill/>, color: 'green' });
                    mutate();
                    router.push('/dash');
                  }
                  else
                    showNotification({ title: 'Failed to sign in.', color: 'red', icon: <RiErrorWarningFill/>, message: r.error });
                }).finally(() => setBusy(false));
              })}>
                <TextInput
                  required
                  icon={<FiUser />}
                  label='Username'
                  {...form.getInputProps('username')}
                />
                <PasswordInput
                  required
                  icon={<FiLock />}
                  label='Password'
                  {...form.getInputProps('password')}>
                </PasswordInput>
                <Checkbox mt='md' label='Remember me' {...form.getInputProps('rememberMe', { type: 'checkbox' })}/>
                {/*<Button leftIcon={<FiEdit />} variant='subtle'>Register</Button>*/}
                <Button loading={busy} fullWidth leftIcon={<FiLogIn />} mt='xs' type='submit'>Login</Button>
                <Divider my='xs' mx={128}/>
                <Button loading={busy} fullWidth style={{ backgroundColor: '#7289DA' }} onClick={loginWithDiscord} leftIcon={<SiDiscord/>}>Login with Discord</Button>
              </form>
            </Group>
          </Container>
        )}
      </Transition>
      <Affix position={{ bottom: '2%', right: '2% ' }}>
        <Badge variant='filled' radius='xs' size='md' px='xs'>
          <Group spacing={0}>
            <Text ml='xs' style={{ fontSize: 10 }}>
              {process.env.voidVersion}
            </Text>
            <ActionIcon variant='transparent' style={{ color: 'white' }} onClick={() => toggleColorScheme()}>
              {colorScheme === 'dark' ? <RiSunFill /> : <RiMoonClearFill />}
            </ActionIcon>
          </Group>
        </Badge>
      </Affix>
    </Paper>
  );
}

LoginPage.title = 'Login';
