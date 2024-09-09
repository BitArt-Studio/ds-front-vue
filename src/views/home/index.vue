<template>
  <div class="w-250 m-auto h-full">
    <div class="flex w-full h-100">
      <div class="w-1/2 flex flex-col text-xl justify-between">
        <div>
          <div class="text-5xl font-bold mb-2 w-full textRed">Dance of Struct</div>
          <div>
            <div class="text-bold">By Algorithm Artist<span class="font-bold">-RKStone</span></div>
            <div class="text-gray">Recursive inscription algorithm art</div>
          </div>
        </div>
        <div class="flex-col space-y-2">
          <div class="font-bold flex items-center">
            <Icon icon="clarity:block-solid" class="mr-2" />
            Block Range
          </div>
          <div class="ml-4">{{ blockHeightStart }} ~ {{ blockHeightEnd }}</div>
          <div class="font-bold flex items-center">
            <Icon class="mr-2" icon="weui:time-outlined" />
            Time Range
          </div>
          <div class="ml-4">{{ formatDate(timeStart) }} ~ {{ formatDate(timeEnd) }}</div>
          <div class="font-bold flex items-center">
            <Icon class="mr-2" icon="game-icons:sands-of-time" />
            Remaining Block
          </div>
          <div>
            <span class="font-bold text-2xl ml-4 textRed">{{ restBlock }}</span> Blocks
          </div>
        </div>
        <div class="flex w-85">
          <el-button
            v-if="address.length == 0"
            :disabled="restBlock <= 0"
            class="w-7/10"
            type="danger"
            size="large"
            @click="connectWalletClick"
          >
            <div v-if="restBlock <= 0">Finished</div>
            <div v-else>Connection Wallet</div>
          </el-button>
          <div v-else class="w-full flex">
            <el-button class="w-7/10" type="danger" size="large" @click="mintClick">Start Mint</el-button>
            <el-button :loading="reLoading" type="info" class="w-3/10" size="large" @click="reGenerate"
              >Rebuild
            </el-button>
          </div>
        </div>
      </div>
      <div class="w-1/2">
        <iframe class="drop-shadow-2xl w-100 h-100 ml-auto" :src="`${baseSeedUrl}/${hSeed}`"></iframe>
      </div>
    </div>
    <el-dialog
      v-model="dialogVisible"
      loading
      :close-on-click-modal="false"
      destroy-on-close
      :show-close="false"
      :width="800"
      @open="dialogOpen"
    >
      <template #header>
        <div class="textRed">Mint Flow</div>
      </template>
      <template #default>
        <div class="flex-col">
          <div class="flex justify-center">
            <el-steps class="w-7/10" :active="step" align-center>
              <el-step title="Select fee rate" />
              <el-step title="Send btc" />
              <el-step title="Finish mint" />
            </el-steps>
          </div>

          <div class="mt-6 text-center flex-col">
            <div v-if="step == 1" class="flex-col space-y-4">
              <iframe class="w-50 h-50 m-auto" :src="`${baseSeedUrl}/${hSeed}`"></iframe>
              <div class="flex items-center justify-center text-xl textRed">
                <div v-if="price == 0">Free Mint</div>
                <div v-else class="flex items-center">
                  Price: {{ price }}
                  <Icon class="ml-2" icon="cryptocurrency-color:btc" />
                </div>
              </div>
              <div></div>
              <div class="w-1/2 m-auto">Address: {{ address }}</div>
              <div>
                <el-radio-group v-model="radio" @change="changeRadio">
                  <el-radio-button label="Slow" value="1" />
                  <el-radio-button label="Normal" value="2" />
                  <el-radio-button label="Fast" value="3" />
                </el-radio-group>
              </div>
              <div class="text-gray-500">
                <span>{{ feeRate }}</span> sats/vB
              </div>
            </div>
            <div v-else-if="step == 2" class="flex-col space-y-4">
              <div class="textRed text-xl">
                <div v-if="!sendFail">Please sign transaction with unisat wallet</div>
                <div v-else>Send btc fail, you can try again.</div>
              </div>
              <div>Wait pay address: {{ saveOrderResponse.payAddress }}</div>
              <div>
                Pay fee: {{ saveOrderResponse.estimateFee / 1e8 }}
                <Icon class="ml-2" icon="cryptocurrency-color:btc" />
              </div>
            </div>
            <div v-else-if="step == 3" class="textRed text-xl flex-col space-y-4">
              <div v-if="executeOrderResponse.revealTxHash.length <= 0">Please wait mint success.</div>
              <div v-else>
                Congratulations! you can lock at:
                <el-button link type="primary">
                  <a :href="`${baseMempoolUrl}/tx/${executeOrderResponse.revealTxHash}`" target="_blank">
                    {{ executeOrderResponse.revealTxHash }}</a
                  >
                </el-button>
              </div>
            </div>
          </div>

          <div class="w-full text-right">
            <div v-if="step == 1 || step == 2">
              <el-button link type="info" @click="dialogVisible = false">Cancel</el-button>
              <el-button v-if="sendFail" link type="danger" @click="nextClick">Try again</el-button>
              <el-button v-else link type="danger" :loading="step == 2 && txId.length <= 0" @click="nextClick"
                >Next
              </el-button>
            </div>
            <div v-else>
              <el-button :loading="loading" link type="info" @click="dialogVisible = false">Finished</el-button>
            </div>
          </div>
        </div>
      </template>
    </el-dialog>

    <el-card class="mt-10">
      <template #header>
        <div class="textRed text-xl font-bold flex items-center">Whitelist Verification</div>
      </template>
      <el-input v-model="whiteListAddress" :size="'large'" placeholder="Your BTC Address">
        <template #append>
          <el-button :loading="searchLoading" :icon="Search" @click="whiteListSearch" />
        </template>
      </el-input>
      <div v-if="isValid != undefined" class="textRed mt-2">
        <div v-if="isValid">The address is on the whitelist</div>
        <div v-else>Sorry! You're not whitelisted</div>
      </div>
    </el-card>
    <div class="mt-10">
      <div class="textRed text-2xl border-b-1 pb-2">FAQ</div>
      <el-collapse v-model="collapse" accordion>
        <el-collapse-item title="" name="1">
          <template #title>
            <div class="font-bold text-[#409EFF]">Our Perspective on Art</div>
          </template>
          <div class="flex-col space-y-4">
            <div>
              Art has always been a brilliant jewel in the spiritual world of humanity. Science, philosophy, and art
              together fulfill humanity's spiritual pursuit of truth, goodness, and beauty.
            </div>
            <div>
              Artists use their paintings or other techniques to express their spiritual selves and the appearance of
              the world, showing people the material and spiritual worlds that can be inherited. From the cave paintings
              created with stone knives in ancient times, to Da Vinci’s perfect three-dimensional perspective paintings
              through mathematical calculations, to the Impressionist works of Monet and Cézanne completed with light
              and shadow theory, to Picasso’s depiction of the cruelty of war through cubist and abstract techniques,
              and to modern times where Wu Guanzhong, Wu Changshuo, and Huang Binhong used ink and wash to complete
              Chinese abstract art works, all these record and express their spiritual sustenance and feelings towards
              the world and themselves at the time through art and aesthetics.
            </div>
            <div>
              Today, since Apple ushered in the era of personal computers, our world has gradually entered the digital
              age. From Yahoo and Google search engines to social networks like Facebook and Tencent, from Douyin to
              TikTok, and from Tesla to BYD, we are living in a digitally constructed world. In 2009, the Bitcoin
              network, which combines asymmetric encryption, distributed processing, consensus algorithms, and economic
              principles, emerged, providing a haven for assets in the digital world. Since then, digital artworks have
              gained value anchoring in this digital era. Artists can now put their works on the blockchain for
              copyright, finally offering a perfect solution for the ownership of digital works. In 2021, art pieces
              issued based on Ethereum smart contracts were auctioned multiple times at top auction houses like
              Sotheby’s and Christie’s, with some pieces reaching prices close to those of traditional art masters.
              After years of development, digital artworks have finally gained a foothold. Digital artworks, as
              contemporary art of the digital new world, will surely gain recognition in value with the maturity of
              blockchain technology and the popularization of digital currencies.
            </div>
            <div>This is our worldview on digital art.</div>
          </div>
        </el-collapse-item>
        <el-collapse-item title="Introduction to Algorithmic Art" name="2">
          <div class="flex-col space-y-4">
            <div class="text">
              <p>
                In today's society, from Google’s advertising algorithms to Douyin’s recommendation algorithms, from
                ordinary electronic access control to artificial intelligence’s deep learning networks,
              </p>
              <p>
                algorithms, as the most efficient and powerful tools of the digital age, are constantly influencing and
                changing people's lives.
              </p>
              <p>
                Besides playing an important role in science and industry, algorithms, as a form of intellectual tools
                represented by code, are also an important technical method in digital art.
              </p>
              <p>
                Just like oil painting techniques in oil painting and ink techniques in Chinese painting, algorithmic
                programming is a skill that digital artists need years of training to master for artistic creation.
              </p>
            </div>
            <div>
              <p>
                Generative art, also known as algorithmic art or code art: After an artist designs and creates an
                algorithm or code, when the computer executes this code,
              </p>
              <p>
                the algorithm creates and generates a digital artwork displayed on the screen in real-time according to
                specified rules and a certain degree of randomness.
              </p>
              <p>
                Due to different random seeds each time, collectors can also interact with the program to participate in
                the creation and collection of the artwork.
              </p>
            </div>
            <div>
              We believe algorithmic art is the most innovative type of art asset in the digital asset era, representing
              contemporary art of the digital age.
            </div>
          </div>
        </el-collapse-item>
        <el-collapse-item title="Why We Choose Bitcoin as a Medium for Art Storage" name="3">
          <div>
            <p>Throughout history, every kind of artwork has its own medium:</p>
            <p>
              Wall paintings carved on walls, textures carved on shells, writings inscribed on bronze, to gold, jade,
              and canvas used for oil paintings, and the Xuan paper and silk used for Chinese paintings.
            </p>
            <p>The medium that carries the artwork determines its longevity and the security level of the asset.</p>
            <p>
              As the most secure technical implementation of digital assets to date, the decentralized Bitcoin network
              has been running stably for 15 years without any security issues on its main chain.
            </p>
            <p>
              Choosing the Bitcoin network as the storage medium for generative art is the safest artistic medium to
              date.
            </p>
            <p>
              In other words, putting our works on the Bitcoin network allows collectors’ art assets to be stored in the
              safest place in the world.
            </p>
          </div>
        </el-collapse-item>
        <el-collapse-item title="Why Choose the Bitcoin Ordinals Protocol" name="4">
          <div>
            <p>
              Before 2023, it was almost impossible to issue and trade other types of assets on the Bitcoin network
              besides Bitcoin.
            </p>
            <p>
              The birth of the Ordinals protocol made it possible to store and trade other types of digital assets on
              the Bitcoin mainnet.
            </p>
            <p>
              Although other protocols, including L2, are available, after comprehensive consideration, we believe that
              using the Ordinals protocol to issue this project is the best choice at this stage.
            </p>
            <p>This also pays homage to the Columbus of the digital art world!</p>
          </div>
        </el-collapse-item>
        <el-collapse-item title="About The Dance of Struct" name="5">
          <div>
            <p>
              "The Dance of Struct" explores the essence of everyday objects through the lens of basic geometric shapes.
              In the industrial and post-industrial era, I find that objects bear the unique imprint of industrial
              machinery, presenting forms shaped by geometric elements. From the curves of products to the structures of
              roads and buildings, these are composed of controlled industrial geometric elements, forming the
              environment around us.
            </p>
            <p>
              The work is an exploratory creation from a visual aesthetic perspective, aiming to capture contemporary
              rationality and an appreciation for order within the industrial field. By utilizing basic geometric
              shapes, it not only depicts the visual characteristics of objects in the computer age but also reveals the
              fundamental structures and principles forged by industrial processes. The intentional arrangement and
              combination of these shapes encourage viewers to reflect on various industrial scenes and elements,
              prompting them to ponder the intricate relationship between industry and art.
            </p>
            <p>
              Through abstract language, my series transcends simple representation, providing a canvas that stimulates
              the viewer's imagination and allows them to interpret the artwork from a unique perspective. Filled with
              contemporary industrial rationality and an appreciation for the aesthetics of order, "The Dance of
              Structures" invites viewers to explore the visual impact and thought-provoking ways at the intersection of
              industry and art.
            </p>
            <p>
              "The Dance of Struct" is not only an exploration of the integration of industrial geometry and aesthetic
              structure but also a contemplation of the balance between rationality and sensibility. Through the
              language of abstract art, the work conveys the order and beauty within industrial civilization while also
              expressing the freedom and vitality of individuals within the structure. Introducing the palette of
              contemporary art masters adds diversity and modernity to the work, reflecting the inclusiveness and
              innovation of crypto art within the Bitcoin ecosystem.
            </p>
            <p>
              "Dance of Struct" is the second inscription art work by algorithmic artist RKStone. The successful launch
              of the previous game "ColorMask" has been recognized and loved by collectors and the community. In
              addition, the "ColorMask" algorithmic art project has also brought considerable airdrop benefits to the
              collector community. The team is very grateful to collectors and the BTC ecosystem for their support.
            </p>
          </div>
        </el-collapse-item>
        <el-collapse-item title="About BAStudio and next steps" name="6">
          <div>
            <p>
              BAStuido is a technical team from the BTC development community. The team adheres to using the best
              technology to support artists to sell excellent works of art in the BTC ecosystem, spread BTC ideas and
              encryption concepts, and introduce the world's outstanding artists into the BTC ecosystem, continuing to
              build and expand the influence of the BTC ecosystem.
            </p>
            <p>
              In addition to the research and development of artistic inscriptions on the first layer of BTC, we will
              also conduct research and development of related projects and technologies on the second layer of Fractal
              Bitcoin network to bring more artistic works to the second layer of Bitcoin.
            </p>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Search } from '@element-plus/icons-vue';
import * as Api from '@/api/modules/all';
import * as MempoolApi from '@/api/modules/mempool';

const loading = ref(false);
const reLoading = ref(false);
const searchLoading = ref(false);
const address = ref('');
const hSeed = ref('dBxo0jBAYVAGP3yb');
const dialogVisible = ref(false);
const radio = ref('Normal');
const baseSeedUrl = `${import.meta.env.VITE_API_BASEURL}/seed/seedHTML`;
const baseMempoolUrl =
  import.meta.env.VITE_MODE === 'testnet' ? 'https://mempool.space/testnet' : 'https://mempool.space';
const step = ref(1);
const price = ref(0.0008);
const whiteListAddress = ref('');
const isValid = ref(undefined);
const collapse = ref('1');
const saveOrderResponse = ref({
  estimateFee: 0,
  hSeed: '',
  orderId: '',
  payAddress: '',
});
const executeOrderResponse = ref({
  inscriptionsId: '',
  revealTxHash: '',
});
const txId = ref('');
const sendFail = ref(false);
const blockHeightStart = import.meta.env.VITE_BLOCK_HEIGHT_START;
const blockHeightEnd = import.meta.env.VITE_BLOCK_HEIGHT_END;
const timeStart = ref(new Date('2022-12-31'));
const timeEnd = ref(new Date('2022-12-31'));
const restBlock = ref(0);
const whiteListSearch = async () => {
  if (whiteListAddress.value.length <= 0) {
    ElNotification.error({
      title: 'Whitelist',
      message: 'Please input wallet address',
    });
  } else {
    try {
      searchLoading.value = true;
      isValid.value = (await Api.whiteListValidate(whiteListAddress.value)).isValid;
    } finally {
      searchLoading.value = false;
    }
  }
};

const reGenerate = async () => {
  try {
    reLoading.value = true;
    const randomUsableSeedRes = await Api.randomUsableSeed(address.value);
    hSeed.value = randomUsableSeedRes.hSeed;
  } catch (e) {
    console.error(e);
  } finally {
    reLoading.value = false;
  }
};

const check = async () => {
  window.unisat.switchChain(
    import.meta.env.VITE_MODE === 'testnet' ? 'FRACTAL_BITCOIN_TESTNET' : 'FRACTAL_BITCOIN_MAINNET',
  );

  // const res = await window.unisat.getNetwork();
  // if (res !== import.meta.env.VITE_MODE) {
  //   await window.unisat.switchNetwork(import.meta.env.VITE_MODE);
  // }

  if (!address.value.startsWith('bc1p')) {
    address.value = '';
    ElNotification.error({
      title: 'Address type error',
      message: 'Please use Taproot address',
    });
    throw new Error('Address Type Error');
  }
};

const connectWalletClick = async () => {
  if (typeof window.unisat !== 'undefined') {
    console.log('UniSat Wallet is installed!');
  } else {
    ElNotification.error({
      title: 'UniSat Wallet',
      message: 'UniSat Wallet is not installed!',
    });
  }
  try {
    const accounts = await window.unisat.requestAccounts();
    console.log('connect success', accounts);
    address.value = accounts[0];

    await check();
  } catch (e) {
    console.error(e);
  }

  window.unisat.on('accountsChanged', (accounts: Array<string>) => {
    address.value = accounts[0];
    check();
  });

  await reGenerate();
};

const mintClick = async () => {
  dialogVisible.value = true;
};

const feeRate = ref(0);
const feeRateMap = ref({
  Slow: 0,
  Normal: 0,
  Fast: 0,
});

const changeRadio = (val: string) => {
  feeRate.value = feeRateMap.value[val];
};

const dialogOpen = async () => {
  try {
    step.value = 1;
    sendFail.value = false;
    loading.value = true;
    const data = await MempoolApi.getFeeRate();
    feeRateMap.value = {
      Slow: Math.ceil(data.minimumFee),
      Normal: Math.ceil(data.halfHourFee),
      Fast: Math.ceil(data.fastestFee),
    };
    changeRadio('Normal');
    if ((await Api.whiteListValidate(address.value)).isValid) {
      price.value = 0;
    }
    executeOrderResponse.value = {
      inscriptionsId: '',
      revealTxHash: '',
    };
  } finally {
    loading.value = false;
  }
};

const nextClick = async () => {
  if (!sendFail.value) {
    step.value += 1;
  }

  try {
    await check();

    saveOrderResponse.value = await Api.saveOrder(address.value, feeRate.value);
    console.log(saveOrderResponse.value);
    try {
      loading.value = true;
      txId.value = await window.unisat.sendBitcoin(
        saveOrderResponse.value.payAddress,
        saveOrderResponse.value.estimateFee,
      );
      step.value += 1;
    } catch (e) {
      sendFail.value = true;
      throw e;
    }

    executeOrderResponse.value = await Api.executeOrder(saveOrderResponse.value.orderId);

    await reGenerate();
  } catch (e) {
    console.log(e);
  } finally {
    loading.value = false;
  }
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1，并且确保两位数
  const day = String(date.getDate()).padStart(2, '0'); // 确保两位数
  return `${year}-${month}-${day}`;
}

async function task() {
  const height = await MempoolApi.getTipHeight();
  if (height < blockHeightEnd) {
    restBlock.value = blockHeightEnd - height;
  } else {
    restBlock.value = 0;
  }
}

onMounted(() => {
  task();
  setInterval(task, 2 * 60 * 1000);

  const timeAnchor =
    import.meta.env.VITE_MODE === 'testnet'
      ? {
          timestamp: 1722228488000,
          blockHeight: 2870783,
        }
      : { timestamp: 1722227987000, blockHeight: 854436 };
  timeStart.value = new Date(timeAnchor.timestamp + (blockHeightStart - timeAnchor.blockHeight) * 10 * 60 * 1000);
  timeEnd.value = new Date(timeAnchor.timestamp + (blockHeightEnd - timeAnchor.blockHeight) * 10 * 60 * 1000);
});
</script>
false
<style lang="scss" scoped>
.img {
  @apply w-100 w-100;
}

.textRed {
  @apply text-[#F56C6C];
}
</style>
